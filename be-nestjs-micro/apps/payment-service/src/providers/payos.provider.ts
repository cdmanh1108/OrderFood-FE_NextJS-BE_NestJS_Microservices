import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PayOS } from '@payos/node';
import { PaymentMethod } from '@app/contracts/payment/enums/payment-method.enum';
import {
  PaymentProvider,
  CreateProviderPaymentInput,
  CreateProviderPaymentResult,
  VerifyProviderWebhookInput,
  VerifiedProviderWebhook,
  ProviderPaymentStatus,
  ConfirmWebhookUrlInput,
  ConfirmWebhookUrlResult,
} from './payment-provider.interface';

@Injectable()
export class PayosPaymentProvider implements PaymentProvider {
  readonly gateway = PaymentMethod.PAYOS;
  private readonly payos: PayOS;
  private readonly logger = new Logger(PayosPaymentProvider.name);

  constructor(private readonly configService: ConfigService) {
    const clientId =
      this.configService.get<string>('PAYOS_CLIENT_ID') || 'test';
    const apiKey = this.configService.get<string>('PAYOS_API_KEY') || 'test';
    const checksumKey =
      this.configService.get<string>('PAYOS_CHECKSUM_KEY') || 'test';

    this.payos = new PayOS({ clientId, apiKey, checksumKey });
  }

  private toRecord(payload: unknown): Record<string, unknown> {
    if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
      return {};
    }

    return payload as Record<string, unknown>;
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown PayOS error';
  }

  private getErrorStack(error: unknown): string | undefined {
    return error instanceof Error ? error.stack : undefined;
  }

  async createPayment(
    input: CreateProviderPaymentInput,
  ): Promise<CreateProviderPaymentResult> {
    try {
      const orderCode = Number(input.orderCode);
      if (isNaN(orderCode)) {
        throw new Error('PayOS yêu cầu orderCode phải là số');
      }

      const body = {
        orderCode,
        amount: Math.round(Number(input.amount)),
        description:
          input.description?.substring(0, 25) || `Đơn hàng ${orderCode}`,
        cancelUrl:
          input.cancelUrl || `http://localhost:5000/orders/${orderCode}/cancel`,
        returnUrl:
          input.returnUrl ||
          `http://localhost:5000/orders/${orderCode}/success`,
      };

      const response = await this.payos.paymentRequests.create(body);

      return {
        gateway: this.gateway,
        gatewayPaymentId: response.paymentLinkId,
        paymentUrl: response.checkoutUrl,
        rawPayload: this.toRecord(response),
      };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(
        `PayOS createPayment error: ${message}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async verifyWebhook(
    input: VerifyProviderWebhookInput,
  ): Promise<VerifiedProviderWebhook> {
    try {
      // The payload must be the raw body or the verified data.
      // PayOS requires the body data to verify signature.
      const webhookData = await this.payos.webhooks.verify(
        input.payload as Parameters<typeof this.payos.webhooks.verify>[0],
      );
      console.log('PayOS webhook verified data:', webhookData);

      let status: ProviderPaymentStatus = 'PENDING';
      if (webhookData.code === '00') {
        status = 'SUCCEEDED';
      }

      const eventType = webhookData.code
        ? `PAYOS_${webhookData.code}`
        : 'PAYOS_WEBHOOK';
      const eventId =
        webhookData.reference?.toString() ??
        (webhookData.paymentLinkId && webhookData.orderCode
          ? `${webhookData.paymentLinkId}:${webhookData.orderCode}:${webhookData.code ?? 'UNKNOWN'}`
          : undefined);

      return {
        gateway: this.gateway,

        // Quan trọng: phải khớp với createPayment()
        gatewayPaymentId: webhookData.paymentLinkId,

        gatewayTransactionId: webhookData.reference,
        status,
        amount: webhookData.amount?.toString(),
        eventType,
        eventId,
        rawPayload: this.toRecord({
          ...webhookData,
          orderCode: webhookData.orderCode?.toString(),
        }),
      };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(
        `PayOS verifyWebhook error: ${message}`,
        this.getErrorStack(error),
      );
      throw error;
    }
  }

  async confirmWebhookUrl(
    input: ConfirmWebhookUrlInput,
  ): Promise<ConfirmWebhookUrlResult> {
    try {
      await this.payos.webhooks.confirm(input.webhookUrl);
      return {
        gateway: this.gateway,
        success: true,
      };
    } catch (error) {
      const message = this.getErrorMessage(error);
      this.logger.error(
        `PayOS confirmWebhookUrl error: ${message}`,
        this.getErrorStack(error),
      );
      return {
        gateway: this.gateway,
        success: false,
        rawPayload: { error: message },
      };
    }
  }
}
