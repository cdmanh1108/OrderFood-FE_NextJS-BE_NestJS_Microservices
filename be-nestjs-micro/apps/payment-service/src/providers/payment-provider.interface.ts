import { PaymentMethod } from "@app/contracts/payment/enums/payment-method.enum";

// export type PaymentGateway = 'PAYOS' | 'VNPAY' | 'MOMO' | 'STRIPE' | 'MANUAL';

export type ProviderPaymentStatus =
  | 'PENDING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELED';

export interface CreateProviderPaymentInput {
  orderId: string;
  orderCode: string;
  amount: string;
  currency: string;

  description?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;

  returnUrl?: string;
  cancelUrl?: string;
}

export interface CreateProviderPaymentResult {
  gateway: PaymentMethod;
  gatewayPaymentId: string;
  paymentUrl?: string | null;
  rawPayload?: Record<string, any>;
}

export interface VerifyProviderWebhookInput {
  payload: Record<string, any>;
  headers?: Record<string, string | string[] | undefined>;
  signature?: string;
}

export interface VerifiedProviderWebhook {
  gateway: PaymentMethod;
  gatewayPaymentId: string;
  gatewayTransactionId?: string | null;

  status: ProviderPaymentStatus;
  amount?: string;
  currency?: string;

  eventType?: string;
  eventId?: string;

  rawPayload: Record<string, any>;
}

export interface ConfirmWebhookUrlInput {
  webhookUrl: string;
}

export interface ConfirmWebhookUrlResult {
  gateway: PaymentMethod;
  success: boolean;
  rawPayload?: Record<string, any>;
}

export interface PaymentProvider {
  readonly gateway: PaymentMethod;

  createPayment(
    input: CreateProviderPaymentInput,
  ): Promise<CreateProviderPaymentResult>;

  verifyWebhook(
    input: VerifyProviderWebhookInput,
  ): Promise<VerifiedProviderWebhook>;

  /**
   * Optional.
   * Một số gateway như PayOS cần confirm webhook URL trước.
   * Gateway không cần thì không implement.
   */
  confirmWebhookUrl?(
    input: ConfirmWebhookUrlInput,
  ): Promise<ConfirmWebhookUrlResult>;
}