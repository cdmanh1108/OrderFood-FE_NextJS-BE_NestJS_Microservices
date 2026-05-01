import { Inject, Injectable } from '@nestjs/common';

import { mapPaymentToResult } from './mappers/payment.mapper';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { PaymentPrismaService } from '@app/database/payment-prisma.service';
import { CancelPaymentCommand } from '@app/contracts/payment/commands/cancel-payment.command';
import { ConfirmPaymentCommand } from '@app/contracts/payment/commands/confirm-payment.command';
import { CreatePaymentCommand } from '@app/contracts/payment/commands/create-payment.command';
import { ExpirePaymentCommand } from '@app/contracts/payment/commands/expire-payment.command';
import { GetPaymentByIdCommand } from '@app/contracts/payment/commands/get-payment-by-id.command';
import { GetPaymentByOrderIdCommand } from '@app/contracts/payment/commands/get-payment-by-order-id.command';
import { ListPaymentsCommand } from '@app/contracts/payment/commands/list-payments.command';
import { PayosPaymentProvider } from '../../providers/payos.provider';
import {
  Prisma,
  PaymentMethod,
  PaymentStatus,
  PaymentTransactionType,
  PaymentTransactionStatus,
} from 'generated/payment';
import { ClientProxy } from '@nestjs/microservices';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { PaymentStatus as OrderingPaymentStatus } from '@app/contracts/ordering/enums/payment-status.enum';
import { OrderStatus as OrderingOrderStatus } from '@app/contracts/ordering/enums/order-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PaymentPrismaService,
    private readonly payosProvider: PayosPaymentProvider,
    @Inject(RMQ_SERVICES.ORDERING) private readonly orderingClient: ClientProxy,
  ) {}

  async create(command: CreatePaymentCommand) {
    const existed = await this.prisma.payment.findUnique({
      where: { orderId: command.orderId },
      include: { transactions: true },
    });

    if (existed) {
      return mapPaymentToResult(existed);
    }

    const method = command.method as PaymentMethod;

    if (!Object.values(PaymentMethod).includes(method)) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: ERRORS.BAD_REQUEST.message,
      });
    }

    const amount = new Prisma.Decimal(command.amount);

    if (amount.lte(0)) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: ERRORS.BAD_REQUEST.message,
      });
    }

    let paymentUrl: string | null | undefined = null;
    let gatewayPaymentId: string | null = null;
    let providerPayload: Record<string, unknown> | null | undefined = null;

    if (method === PaymentMethod.PAYOS) {
      const providerResult = await this.payosProvider.createPayment({
        orderId: command.orderId,
        orderCode: command.orderCode!,
        amount: command.amount.toString(),
        currency: command.currency ?? 'VND',
        description: command.description ?? undefined,
        returnUrl: command.returnUrl ?? undefined,
        cancelUrl: command.cancelUrl ?? undefined,
      });

      paymentUrl = providerResult.paymentUrl;
      gatewayPaymentId = providerResult.gatewayPaymentId;
      providerPayload = providerResult.rawPayload;
    }

    const payment = await this.prisma.payment.create({
      data: {
        orderId: command.orderId,
        orderCode: command.orderCode ?? null,

        method,
        status: PaymentStatus.PENDING,

        amount,
        currency: command.currency ?? 'VND',

        gateway: this.resolveGateway(method),
        gatewayPaymentId,
        paymentUrl,
        checkoutUrl: paymentUrl,
        description: command.description ?? null,
        metadata: this.toInputJsonObject(command.metadata ?? undefined),

        expiresAt: command.expiresAt ? new Date(command.expiresAt) : null,

        transactions: {
          create: {
            type: PaymentTransactionType.CREATE_PAYMENT,
            status: PaymentTransactionStatus.SUCCEEDED,
            amount,
            currency: command.currency ?? 'VND',
            gateway: this.resolveGateway(method),
            gatewayTransactionId: gatewayPaymentId,
            requestPayload: this.toInputJsonObject(
              this.buildCreatePaymentRequestPayload(command),
            ),
            responsePayload: this.toInputJsonObject(
              providerPayload ?? undefined,
            ),
            processedAt: new Date(),
          },
        },
      },
      include: { transactions: true },
    });

    this.emitOrderPaymentStatus(payment.orderId, OrderingPaymentStatus.PENDING);

    return mapPaymentToResult(payment);
  }

  async findById(command: GetPaymentByIdCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: command.id },
      include: { transactions: true },
    });

    if (!payment) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: ERRORS.NOT_FOUND.message,
      });
    }

    return mapPaymentToResult(payment);
  }

  async findByOrderId(command: GetPaymentByOrderIdCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId: command.orderId },
      include: { transactions: true },
    });

    if (!payment) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: ERRORS.NOT_FOUND.message,
      });
    }

    return mapPaymentToResult(payment);
  }

  async list(command: ListPaymentsCommand) {
    const page = command.page && command.page > 0 ? command.page : 1;
    const limit = command.limit && command.limit > 0 ? command.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      orderId: command.orderId,
      orderCode: command.orderCode,
      method: command.method as PaymentMethod,
      status: command.status as PaymentStatus,
      gateway: command.gateway,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { transactions: true },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      items: items.map(mapPaymentToResult),
      page,
      limit,
      total,
    };
  }

  async confirm(command: ConfirmPaymentCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: command.id },
    });

    if (!payment) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy thanh toán',
      });
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      const current = await this.findPaymentWithTransactions(payment.id);
      return mapPaymentToResult(current);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Chỉ có thể xác nhận thanh toán ở trạng thái chờ',
      });
    }

    const processedAt = new Date();
    const transitioned = await this.prisma.$transaction(async (tx) => {
      const transition = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.SUCCEEDED,
          paidAt: processedAt,
          gatewayReference:
            command.gatewayReference ?? payment.gatewayReference,
        },
      });

      if (transition.count === 0) {
        return null;
      }

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: PaymentTransactionType.CONFIRM,
          status: PaymentTransactionStatus.SUCCEEDED,
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway,
          gatewayTransactionId: command.gatewayTransactionId ?? null,
          gatewayReference: command.gatewayReference ?? null,
          rawPayload: this.toInputJsonValue(command.rawPayload ?? undefined),
          processedAt,
        },
      });

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: { transactions: true },
      });
    });

    if (!transitioned) {
      const current = await this.findPaymentWithTransactions(payment.id);
      if (current.status === PaymentStatus.SUCCEEDED) {
        return mapPaymentToResult(current);
      }

      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Chỉ có thể xác nhận thanh toán ở trạng thái chờ',
      });
    }

    this.emitOrderPaymentStatus(
      transitioned.orderId,
      OrderingPaymentStatus.PAID,
    );

    return mapPaymentToResult(transitioned);
  }

  async markSucceeded(command: ConfirmPaymentCommand) {
    return this.confirm(command);
  }

  async markFailed(command: CancelPaymentCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: command.id },
    });

    if (!payment) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy thanh toán',
      });
    }

    if (payment.status === PaymentStatus.FAILED) {
      const current = await this.findPaymentWithTransactions(payment.id);
      return mapPaymentToResult(current);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Chỉ có thể đánh dấu thất bại cho thanh toán ở trạng thái chờ',
      });
    }

    const processedAt = new Date();
    const transitioned = await this.prisma.$transaction(async (tx) => {
      const transition = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.FAILED,
          failedAt: processedAt,
        },
      });

      if (transition.count === 0) {
        return null;
      }

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: PaymentTransactionType.CONFIRM,
          status: PaymentTransactionStatus.FAILED,
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway,
          rawPayload: this.toInputJsonValue(command.rawPayload ?? undefined),
          errorMessage: command.reason ?? null,
          processedAt,
        },
      });

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: { transactions: true },
      });
    });

    if (!transitioned) {
      const current = await this.findPaymentWithTransactions(payment.id);
      if (current.status === PaymentStatus.FAILED) {
        return mapPaymentToResult(current);
      }

      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Chỉ có thể đánh dấu thất bại cho thanh toán ở trạng thái chờ',
      });
    }

    this.emitOrderPaymentStatus(
      transitioned.orderId,
      OrderingPaymentStatus.FAILED,
    );

    return mapPaymentToResult(transitioned);
  }

  async cancel(command: CancelPaymentCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: command.id },
    });

    if (!payment) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy thanh toán',
      });
    }

    if (payment.status === PaymentStatus.CANCELED) {
      const current = await this.findPaymentWithTransactions(payment.id);
      return mapPaymentToResult(current);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Chỉ có thể hủy thanh toán ở trạng thái chờ',
      });
    }

    const processedAt = new Date();
    const transitioned = await this.prisma.$transaction(async (tx) => {
      const transition = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.CANCELED,
          canceledAt: processedAt,
        },
      });

      if (transition.count === 0) {
        return null;
      }

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: PaymentTransactionType.CANCEL,
          status: PaymentTransactionStatus.SUCCEEDED,
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway,
          rawPayload: this.toInputJsonValue(command.rawPayload ?? undefined),
          errorMessage: command.reason ?? null,
          processedAt,
        },
      });

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: { transactions: true },
      });
    });

    if (!transitioned) {
      const current = await this.findPaymentWithTransactions(payment.id);
      if (current.status === PaymentStatus.CANCELED) {
        return mapPaymentToResult(current);
      }

      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Chỉ có thể hủy thanh toán ở trạng thái chờ',
      });
    }

    this.emitOrderStatusUpdate(transitioned.orderId, {
      paymentStatus: OrderingPaymentStatus.FAILED,
      status: OrderingOrderStatus.CANCELED,
    });

    return mapPaymentToResult(transitioned);
  }

  async expire(command: ExpirePaymentCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: command.id },
    });

    if (!payment) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy thanh toán',
      });
    }

    if (payment.status === PaymentStatus.EXPIRED) {
      const current = await this.findPaymentWithTransactions(payment.id);
      return mapPaymentToResult(current);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Chỉ có thể đánh dấu hết hạn cho thanh toán ở trạng thái chờ',
      });
    }

    const processedAt = new Date();
    const transitioned = await this.prisma.$transaction(async (tx) => {
      const transition = await tx.payment.updateMany({
        where: {
          id: payment.id,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.EXPIRED,
          expiredAt: processedAt,
        },
      });

      if (transition.count === 0) {
        return null;
      }

      await tx.paymentTransaction.create({
        data: {
          paymentId: payment.id,
          type: PaymentTransactionType.EXPIRE,
          status: PaymentTransactionStatus.SUCCEEDED,
          amount: payment.amount,
          currency: payment.currency,
          gateway: payment.gateway,
          errorMessage: command.reason ?? null,
          processedAt,
        },
      });

      return tx.payment.findUnique({
        where: { id: payment.id },
        include: { transactions: true },
      });
    });

    if (!transitioned) {
      const current = await this.findPaymentWithTransactions(payment.id);
      if (current.status === PaymentStatus.EXPIRED) {
        return mapPaymentToResult(current);
      }

      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Chỉ có thể đánh dấu hết hạn cho thanh toán ở trạng thái chờ',
      });
    }

    this.emitOrderPaymentStatus(
      transitioned.orderId,
      OrderingPaymentStatus.FAILED,
    );

    return mapPaymentToResult(transitioned);
  }

  private async findPaymentWithTransactions(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { transactions: true },
    });

    if (!payment) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy thanh toán',
      });
    }

    return payment;
  }

  private resolveGateway(method: PaymentMethod): string | null {
    if (
      method === PaymentMethod.PAYOS ||
      method === PaymentMethod.MOMO ||
      method === PaymentMethod.VNPAY ||
      method === PaymentMethod.ZALOPAY ||
      method === PaymentMethod.STRIPE
    ) {
      return method;
    }

    return null;
  }

  private emitOrderPaymentStatus(
    orderId: string,
    paymentStatus: OrderingPaymentStatus,
  ) {
    this.emitOrderStatusUpdate(orderId, { paymentStatus });
  }

  private emitOrderStatusUpdate(
    orderId: string,
    input: {
      paymentStatus?: OrderingPaymentStatus;
      status?: OrderingOrderStatus;
    },
  ) {
    this.orderingClient.emit(ORDERING_PATTERNS.UPDATE_ORDER_STATUS, {
      id: orderId,
      paymentStatus: input.paymentStatus,
      status: input.status,
    });
  }

  private toInputJsonObject(
    value: Record<string, unknown> | null | undefined,
  ): Prisma.InputJsonObject | undefined {
    if (!value) {
      return undefined;
    }

    return value as Prisma.InputJsonObject;
  }

  private toInputJsonValue(
    value: Record<string, unknown> | null | undefined,
  ): Prisma.InputJsonValue | undefined {
    if (!value) {
      return undefined;
    }

    return value as Prisma.InputJsonValue;
  }

  private buildCreatePaymentRequestPayload(
    command: CreatePaymentCommand,
  ): Record<string, unknown> {
    return {
      orderId: command.orderId,
      orderCode: command.orderCode ?? null,
      method: command.method,
      amount: command.amount,
      currency: command.currency ?? null,
      description: command.description ?? null,
      metadata: command.metadata ?? null,
      returnUrl: command.returnUrl ?? null,
      cancelUrl: command.cancelUrl ?? null,
      expiresAt:
        command.expiresAt instanceof Date
          ? command.expiresAt.toISOString()
          : (command.expiresAt ?? null),
    };
  }
}
