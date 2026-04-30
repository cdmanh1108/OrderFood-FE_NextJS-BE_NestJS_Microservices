import { PaymentTransactionType } from '../enums/payment-transaction-type.enum';
import { PaymentTransactionStatus } from '../enums/payment-transaction-status.enum';

export class PaymentTransactionResult {
  id: string;
  paymentId: string;

  type: PaymentTransactionType;
  status: PaymentTransactionStatus;

  amount?: string | null;
  currency: string;

  gateway?: string | null;
  gatewayTransactionId?: string | null;
  gatewayReference?: string | null;

  requestPayload?: Record<string, any> | null;
  responsePayload?: Record<string, any> | null;
  rawPayload?: Record<string, any> | null;

  errorCode?: string | null;
  errorMessage?: string | null;

  processedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}