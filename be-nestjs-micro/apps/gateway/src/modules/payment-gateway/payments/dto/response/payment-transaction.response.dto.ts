import { PaymentTransactionStatus } from '@app/contracts/payment/enums/payment-transaction-status.enum';
import { PaymentTransactionType } from '@app/contracts/payment/enums/payment-transaction-type.enum';

export class PaymentTransactionResponseDto {
  id: string;
  paymentId: string;

  type: PaymentTransactionType;
  status: PaymentTransactionStatus;

  amount?: string | null;
  currency: string;

  gateway?: string | null;
  gatewayTransactionId?: string | null;
  gatewayReference?: string | null;

  requestPayload?: Record<string, unknown> | null;
  responsePayload?: Record<string, unknown> | null;
  rawPayload?: Record<string, unknown> | null;

  errorCode?: string | null;
  errorMessage?: string | null;

  processedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

