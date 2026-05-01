import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PaymentPrismaService } from '@app/database/payment-prisma.service';
import { HandlePaymentWebhookCommand } from '@app/contracts/payment/commands/handle-payment-webhook.command';
import { ConfirmWebhookUrlCommand } from '@app/contracts/payment/commands/confirm-webhook-url.command';
import { ListPaymentWebhookLogsCommand } from '@app/contracts/payment/commands/list-payment-webhook-logs.command';
import { HandlePaymentWebhookResult } from '@app/contracts/payment/results/handle-payment-webhook.result';
import {
  WebhookProcessStatus,
  PaymentStatus,
  PaymentTransactionType,
  PaymentTransactionStatus,
} from 'generated/payment';
import { Prisma } from 'generated/payment';
import { mapWebhookLogToResult } from './mappers/webhook.mapper';
import { PayosPaymentProvider } from '../../providers/payos.provider';
import { PaymentMethod } from '@app/contracts/payment/enums/payment-method.enum';
import { ClientProxy } from '@nestjs/microservices';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { ERRORS } from '@app/common/constants/error-code.constant';

type AcquireWebhookLogResult = {
  logId: string;
  shouldProcess: boolean;
  existingStatus?: WebhookProcessStatus;
  existingPaymentId?: string | null;
};

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PaymentPrismaService,
    private readonly payosProvider: PayosPaymentProvider,
    @Inject(RMQ_SERVICES.ORDERING) private readonly orderingClient: ClientProxy,
  ) {}

  async handleWebhook(
    command: HandlePaymentWebhookCommand,
  ): Promise<HandlePaymentWebhookResult & { webhookLogId?: string }> {
    let logId: string | null = null;
    let eventType: string | null = null;
    let eventId: string | null = null;

    try {
      if (command.gateway !== PaymentMethod.PAYOS) {
        const log = await this.prisma.paymentWebhookLog.create({
          data: {
            gateway: command.gateway,
            headers: this.toInputJsonValue(command.headers ?? undefined),
            payload: this.toRequiredInputJsonValue(command.payload),
            signature: command.signature ?? null,
            status: WebhookProcessStatus.RECEIVED,
          },
        });

        await this.prisma.paymentWebhookLog.update({
          where: { id: log.id },
          data: {
            status: WebhookProcessStatus.IGNORED,
            processedAt: new Date(),
          },
        });

        return {
          success: true,
          ignored: true,
          paymentId: null,
          status: WebhookProcessStatus.IGNORED,
          message: `Da nhan webhook. Cong ${command.gateway} chua duoc trien khai xu ly.`,
          webhookLogId: log.id,
        };
      }

      const verifyResult = await this.payosProvider.verifyWebhook({
        payload: command.payload,
        signature: command.signature ?? undefined,
      });

      eventType = verifyResult.eventType ?? null;
      eventId = this.resolveEventId(command, verifyResult);

      const acquired = await this.acquireWebhookLog({
        command,
        eventType,
        eventId,
      });
      logId = acquired.logId;

      if (!acquired.shouldProcess) {
        return {
          success: true,
          ignored: true,
          paymentId: acquired.existingPaymentId ?? null,
          status: acquired.existingStatus ?? WebhookProcessStatus.PROCESSED,
          message: 'Webhook trung lap, da duoc xu ly truoc do.',
          webhookLogId: acquired.logId,
        };
      }

      const gatewayPaymentId = verifyResult.gatewayPaymentId;
      const payment = gatewayPaymentId
        ? await this.prisma.payment.findFirst({
            where: { gatewayPaymentId },
            orderBy: { createdAt: 'desc' },
          })
        : null;

      if (verifyResult.status !== 'SUCCEEDED') {
        await this.prisma.paymentWebhookLog.update({
          where: { id: logId! },
          data: {
            status: WebhookProcessStatus.IGNORED,
            processedAt: new Date(),
            paymentId: payment?.id ?? null,
            eventType: eventType ?? undefined,
            eventId: eventId ?? undefined,
          },
        });

        return {
          success: true,
          ignored: true,
          paymentId: payment?.id ?? null,
          status: WebhookProcessStatus.IGNORED,
          message:
            'Webhook hop le nhung trang thai thanh toan chua thanh cong.',
          webhookLogId: logId,
        };
      }

      if (!payment) {
        await this.prisma.paymentWebhookLog.update({
          where: { id: logId! },
          data: {
            status: WebhookProcessStatus.IGNORED,
            processedAt: new Date(),
            eventType: eventType ?? undefined,
            eventId: eventId ?? undefined,
          },
        });

        return {
          success: true,
          ignored: true,
          paymentId: null,
          status: WebhookProcessStatus.IGNORED,
          message: 'Khong tim thay ban ghi thanh toan theo gatewayPaymentId.',
          webhookLogId: logId,
        };
      }

      let transitioned = false;

      if (payment.status === PaymentStatus.PENDING) {
        const processedAt = new Date();

        transitioned = await this.prisma.$transaction(async (tx) => {
          const transition = await tx.payment.updateMany({
            where: {
              id: payment.id,
              status: PaymentStatus.PENDING,
            },
            data: {
              status: PaymentStatus.SUCCEEDED,
              paidAt: processedAt,
              gatewayReference: verifyResult.gatewayTransactionId ?? undefined,
            },
          });

          if (transition.count > 0) {
            await tx.paymentTransaction.create({
              data: {
                paymentId: payment.id,
                type: PaymentTransactionType.CONFIRM,
                status: PaymentTransactionStatus.SUCCEEDED,
                amount: payment.amount,
                currency: payment.currency,
                gateway: payment.gateway,
                gatewayTransactionId: verifyResult.gatewayTransactionId,
                rawPayload: this.toInputJsonValue(
                  verifyResult.rawPayload ?? undefined,
                ),
                processedAt,
              },
            });
          }

          await tx.paymentWebhookLog.update({
            where: { id: logId! },
            data: {
              status: WebhookProcessStatus.PROCESSED,
              processedAt,
              paymentId: payment.id,
              eventType: eventType ?? undefined,
              eventId: eventId ?? undefined,
            },
          });

          return transition.count > 0;
        });
      } else {
        await this.prisma.paymentWebhookLog.update({
          where: { id: logId! },
          data: {
            status: WebhookProcessStatus.PROCESSED,
            processedAt: new Date(),
            paymentId: payment.id,
            eventType: eventType ?? undefined,
            eventId: eventId ?? undefined,
          },
        });
      }

      if (transitioned) {
        this.orderingClient.emit(ORDERING_PATTERNS.UPDATE_ORDER_STATUS, {
          id: payment.orderId,
          paymentStatus: 'PAID',
        });
      }

      return {
        success: true,
        ignored: false,
        paymentId: payment.id,
        status: WebhookProcessStatus.PROCESSED,
        message: 'Xu ly webhook thanh cong',
        webhookLogId: logId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Xu ly webhook that bai';

      if (logId) {
        await this.prisma.paymentWebhookLog.update({
          where: { id: logId! },
          data: {
            status: WebhookProcessStatus.FAILED,
            errorMessage,
          },
        });
      } else {
        const failedLog = await this.prisma.paymentWebhookLog.create({
          data: {
            gateway: command.gateway,
            headers: this.toInputJsonValue(command.headers ?? undefined),
            payload: this.toRequiredInputJsonValue(command.payload),
            signature: command.signature ?? null,
            eventType: eventType ?? undefined,
            eventId: eventId ?? undefined,
            status: WebhookProcessStatus.FAILED,
            errorMessage,
            processedAt: new Date(),
          },
        });
        logId = failedLog.id;
      }

      return {
        success: false,
        ignored: false,
        paymentId: null,
        status: WebhookProcessStatus.FAILED,
        message: errorMessage,
        webhookLogId: logId,
      };
    }
  }

  async listWebhookLogs(command: ListPaymentWebhookLogsCommand) {
    const page = command.page && command.page > 0 ? command.page : 1;
    const limit = command.limit && command.limit > 0 ? command.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWebhookLogWhereInput = {
      paymentId: command.paymentId,
      gateway: command.gateway,
      eventType: command.eventType,
      eventId: command.eventId,
      status: command.status as WebhookProcessStatus,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.paymentWebhookLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.paymentWebhookLog.count({ where }),
    ]);

    return {
      items: items.map(mapWebhookLogToResult),
      page,
      limit,
      total,
    };
  }

  async confirmWebhookUrl(command: ConfirmWebhookUrlCommand) {
    if (command.gateway === PaymentMethod.PAYOS) {
      if (this.payosProvider.confirmWebhookUrl) {
        return this.payosProvider.confirmWebhookUrl({
          webhookUrl: command.webhookUrl,
        });
      }
    }

    throw new AppRpcException({
      code: ERRORS.BAD_REQUEST.code,
      message: `Cong thanh toan ${command.gateway} khong ho tro dang ky webhook URL tu dong.`,
    });
  }

  private async acquireWebhookLog(input: {
    command: HandlePaymentWebhookCommand;
    eventType: string | null;
    eventId: string;
  }): Promise<AcquireWebhookLogResult> {
    try {
      const created = await this.prisma.paymentWebhookLog.create({
        data: {
          gateway: input.command.gateway,
          eventType: input.eventType,
          eventId: input.eventId,
          headers: this.toInputJsonValue(input.command.headers ?? undefined),
          payload: this.toRequiredInputJsonValue(input.command.payload),
          signature: input.command.signature ?? null,
          status: WebhookProcessStatus.RECEIVED,
        },
      });

      return {
        logId: created.id,
        shouldProcess: true,
      };
    } catch (error) {
      if (!this.isUniqueConstraintError(error)) {
        throw error;
      }

      const existing = await this.prisma.paymentWebhookLog.findFirst({
        where: {
          gateway: input.command.gateway,
          eventId: input.eventId,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!existing) {
        throw error;
      }

      if (existing.status === WebhookProcessStatus.FAILED) {
        const reopened = await this.prisma.paymentWebhookLog.update({
          where: { id: existing.id },
          data: {
            status: WebhookProcessStatus.RECEIVED,
            processedAt: null,
            errorMessage: null,
            headers: this.toInputJsonValue(input.command.headers ?? undefined),
            payload: this.toRequiredInputJsonValue(input.command.payload),
            signature: input.command.signature ?? null,
          },
        });

        return {
          logId: reopened.id,
          shouldProcess: true,
        };
      }

      return {
        logId: existing.id,
        shouldProcess: false,
        existingStatus: existing.status,
        existingPaymentId: existing.paymentId,
      };
    }
  }

  private resolveEventId(
    command: HandlePaymentWebhookCommand,
    verifyResult: {
      eventId?: string;
      gatewayPaymentId?: string;
      gatewayTransactionId?: string | null;
      status?: string;
      rawPayload: Record<string, unknown>;
    },
  ): string {
    if (verifyResult.eventId && verifyResult.eventId.trim()) {
      return verifyResult.eventId.trim().slice(0, 180);
    }

    const hashInput = [
      command.gateway,
      verifyResult.gatewayPaymentId ?? '',
      verifyResult.gatewayTransactionId ?? '',
      verifyResult.status ?? '',
      JSON.stringify(verifyResult.rawPayload ?? command.payload ?? {}),
    ].join('|');

    const hash = createHash('sha256').update(hashInput).digest('hex');
    return `PAYOS_FALLBACK_${hash}`.slice(0, 180);
  }

  private isUniqueConstraintError(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private toInputJsonValue(
    value: Record<string, unknown> | null | undefined,
  ): Prisma.InputJsonValue | undefined {
    if (!value) {
      return undefined;
    }

    return value as Prisma.InputJsonValue;
  }

  private toRequiredInputJsonValue(
    value: Record<string, unknown>,
  ): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
  }
}
