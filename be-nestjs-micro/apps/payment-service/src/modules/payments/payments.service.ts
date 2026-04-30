import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { mapPaymentToResult } from './mappers/payment.mapper';
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

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PaymentPrismaService,
    private readonly payosProvider: PayosPaymentProvider,
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
      throw new BadRequestException('Phương thức thanh toán không hợp lệ');
    }

    const amount = new Prisma.Decimal(command.amount);

    if (amount.lte(0)) {
      throw new BadRequestException('Số tiền thanh toán phải lớn hơn 0');
    }

    let paymentUrl: string | null | undefined = null;
    let gatewayPaymentId: string | null = null;
    let providerPayload: Record<string, any> | null | undefined = null;

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
        metadata: command.metadata ?? undefined,

        expiresAt: command.expiresAt ? new Date(command.expiresAt) : null,

        transactions: {
          create: {
            type: PaymentTransactionType.CREATE_PAYMENT,
            status: PaymentTransactionStatus.SUCCEEDED,
            amount,
            currency: command.currency ?? 'VND',
            gateway: this.resolveGateway(method),
            gatewayTransactionId: gatewayPaymentId,
            requestPayload: command as any,
            responsePayload: providerPayload as any,
            processedAt: new Date(),
          },
        },
      },
      include: { transactions: true },
    });

    return mapPaymentToResult(payment);
  }

  async findById(command: GetPaymentByIdCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: command.id },
      include: { transactions: true },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    return mapPaymentToResult(payment);
  }

  async findByOrderId(command: GetPaymentByOrderIdCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId: command.orderId },
      include: { transactions: true },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán');
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
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      const current = await this.prisma.payment.findUnique({
        where: { id: payment.id },
        include: { transactions: true },
      });

      return mapPaymentToResult(current);
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể xác nhận thanh toán ở trạng thái chờ',
      );
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.SUCCEEDED,
        paidAt: new Date(),

        gatewayReference: command.gatewayReference ?? payment.gatewayReference,

        transactions: {
          create: {
            type: PaymentTransactionType.CONFIRM,
            status: PaymentTransactionStatus.SUCCEEDED,
            amount: payment.amount,
            currency: payment.currency,
            gateway: payment.gateway,
            gatewayTransactionId: command.gatewayTransactionId ?? null,
            gatewayReference: command.gatewayReference ?? null,
            rawPayload: command.rawPayload ?? undefined,
            processedAt: new Date(),
          },
        },
      },
      include: { transactions: true },
    });

    return mapPaymentToResult(updated);
  }

  async markSucceeded(command: ConfirmPaymentCommand) {
    return this.confirm(command);
  }

  async markFailed(command: CancelPaymentCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: command.id },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể đánh dấu thất bại cho thanh toán ở trạng thái chờ',
      );
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        failedAt: new Date(),

        transactions: {
          create: {
            type: PaymentTransactionType.CONFIRM,
            status: PaymentTransactionStatus.FAILED,
            amount: payment.amount,
            currency: payment.currency,
            gateway: payment.gateway,
            rawPayload: command.rawPayload ?? undefined,
            errorMessage: command.reason ?? null,
            processedAt: new Date(),
          },
        },
      },
      include: { transactions: true },
    });

    return mapPaymentToResult(updated);
  }

  async cancel(command: CancelPaymentCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: command.id },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể hủy thanh toán ở trạng thái chờ',
      );
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.CANCELED,
        canceledAt: new Date(),

        transactions: {
          create: {
            type: PaymentTransactionType.CANCEL,
            status: PaymentTransactionStatus.SUCCEEDED,
            amount: payment.amount,
            currency: payment.currency,
            gateway: payment.gateway,
            rawPayload: command.rawPayload ?? undefined,
            errorMessage: command.reason ?? null,
            processedAt: new Date(),
          },
        },
      },
      include: { transactions: true },
    });

    return mapPaymentToResult(updated);
  }

  async expire(command: ExpirePaymentCommand) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: command.id },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy thanh toán');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể đánh dấu hết hạn cho thanh toán ở trạng thái chờ',
      );
    }

    const updated = await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.EXPIRED,
        expiredAt: new Date(),

        transactions: {
          create: {
            type: PaymentTransactionType.EXPIRE,
            status: PaymentTransactionStatus.SUCCEEDED,
            amount: payment.amount,
            currency: payment.currency,
            gateway: payment.gateway,
            errorMessage: command.reason ?? null,
            processedAt: new Date(),
          },
        },
      },
      include: { transactions: true },
    });

    return mapPaymentToResult(updated);
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
}
