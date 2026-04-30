import { Inject, Injectable } from '@nestjs/common';
import { PaymentPrismaService } from '@app/database/payment-prisma.service';
import { HandlePaymentWebhookCommand } from '@app/contracts/payment/commands/handle-payment-webhook.command';
import { ConfirmWebhookUrlCommand } from '@app/contracts/payment/commands/confirm-webhook-url.command';
import { ListPaymentWebhookLogsCommand } from '@app/contracts/payment/commands/list-payment-webhook-logs.command';
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

@Injectable()
export class WebhooksService {
  constructor(
    private readonly prisma: PaymentPrismaService,
    private readonly payosProvider: PayosPaymentProvider,
    @Inject(RMQ_SERVICES.ORDERING) private readonly orderingClient: ClientProxy,
  ) {}

  async handleWebhook(command: HandlePaymentWebhookCommand) {
    const log = await this.prisma.paymentWebhookLog.create({
      data: {
        gateway: command.gateway,
        headers: command.headers ?? undefined,
        payload: command.payload,
        signature: command.signature ?? null,
        status: WebhookProcessStatus.RECEIVED,
      },
    });

    try {
      if (command.gateway === PaymentMethod.PAYOS) {
        const verifyResult = await this.payosProvider.verifyWebhook({
          payload: command.payload,
          signature: command.signature ?? undefined,
        });

        if (verifyResult.status === 'SUCCEEDED') {
          const payment = await this.prisma.payment.findFirst({
            where: { orderCode: verifyResult.gatewayPaymentId },
          });

          if (payment && payment.status === PaymentStatus.PENDING) {
            await this.prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.SUCCEEDED,
                paidAt: new Date(),
                gatewayReference:
                  verifyResult.gatewayTransactionId ?? undefined,
                transactions: {
                  create: {
                    type: PaymentTransactionType.CONFIRM,
                    status: PaymentTransactionStatus.SUCCEEDED,
                    amount: payment.amount,
                    currency: payment.currency,
                    gateway: payment.gateway,
                    gatewayTransactionId: verifyResult.gatewayTransactionId,
                    rawPayload: verifyResult.rawPayload,
                    processedAt: new Date(),
                  },
                },
              },
            });

            // Gửi message cho OrderingService biết đơn hàng đã thanh toán
            this.orderingClient.emit(ORDERING_PATTERNS.UPDATE_ORDER_STATUS, {
              id: payment.orderId,
              paymentStatus: 'PAID',
            });
          }

          await this.prisma.paymentWebhookLog.update({
            where: { id: log.id },
            data: { status: WebhookProcessStatus.PROCESSED },
          });

          return {
            success: true,
            ignored: false,
            paymentId: payment?.id ?? null,
            status: WebhookProcessStatus.PROCESSED,
            message: 'Webhook processed successfully',
            webhookLogId: log.id,
          };
        }
      }

      // Default fallback
      return {
        success: true,
        ignored: true,
        paymentId: null,
        status: WebhookProcessStatus.RECEIVED,
        message: `Đã nhận Webhook. Trình xử lý cho cổng ${command.gateway} chưa được triển khai.`,
        webhookLogId: log.id,
      };
    } catch (error) {
      await this.prisma.paymentWebhookLog.update({
        where: { id: log.id },
        data: {
          status: WebhookProcessStatus.FAILED,
          errorMessage: error.message,
        },
      });

      return {
        success: false,
        ignored: false,
        paymentId: null,
        status: WebhookProcessStatus.FAILED,
        message: error.message,
        webhookLogId: log.id,
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

    throw new Error(
      `Cổng thanh toán ${command.gateway} không hỗ trợ đăng ký webhook url tự động.`,
    );
  }
}
