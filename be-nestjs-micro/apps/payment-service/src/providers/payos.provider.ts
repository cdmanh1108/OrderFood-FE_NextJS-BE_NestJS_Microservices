import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import  {PayOS } from '@payos/node';
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
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID') || 'test';
    const apiKey = this.configService.get<string>('PAYOS_API_KEY') || 'test';
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY') || 'test';

    this.payos = new PayOS({clientId, apiKey, checksumKey});
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
        description: input.description?.substring(0, 25) || `Đơn hàng ${orderCode}`,
        cancelUrl: input.cancelUrl || `http://localhost:5000/orders/${orderCode}/cancel`,
        returnUrl: input.returnUrl || `http://localhost:5000/orders/${orderCode}/success`,
      };

      const response = await this.payos.paymentRequests.create(body);

      return {
        gateway: this.gateway,
        gatewayPaymentId: response.paymentLinkId,
        paymentUrl: response.checkoutUrl,
        rawPayload: response as any,
      };
    } catch (error) {
      this.logger.error(`PayOS createPayment error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verifyWebhook(
    input: VerifyProviderWebhookInput,
  ): Promise<VerifiedProviderWebhook> {
    try {
      // The payload must be the raw body or the verified data.
      // PayOS requires the body data to verify signature.
      const webhookData = await this.payos.webhooks.verify(input.payload as any);

      let status: ProviderPaymentStatus = 'PENDING';
      if (webhookData.code === '00' && webhookData.description == 'success') {
         status = 'SUCCEEDED';
      }

      return {
        gateway: this.gateway,
        gatewayPaymentId: webhookData.orderCode.toString(),
        gatewayTransactionId: webhookData.reference,
        status,
        amount: webhookData.amount.toString(),
        rawPayload: webhookData as any,
      };
    } catch (error) {
      this.logger.error(`PayOS verifyWebhook error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async confirmWebhookUrl(
    input: ConfirmWebhookUrlInput,
  ): Promise<ConfirmWebhookUrlResult> {
    try {
      await this.payos.webhooks.confirm(input.webhookUrl)
      return {
        gateway: this.gateway,
        success: true,
      };
    } catch (error) {
      this.logger.error(`PayOS confirmWebhookUrl error: ${error.message}`, error.stack);
      return {
        gateway: this.gateway,
        success: false,
        rawPayload: { error: error.message },
      };
    }
  }
}
