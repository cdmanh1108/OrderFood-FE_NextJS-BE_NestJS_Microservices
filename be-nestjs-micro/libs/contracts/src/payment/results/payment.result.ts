import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentTransactionResult } from './payment-transaction.result';

export class PaymentResult {
  id: string;

  orderId: string;
  orderCode?: string | null;

  method: PaymentMethod;
  status: PaymentStatus;

  amount: string;
  currency: string;

  gateway?: string | null;
  gatewayPaymentId?: string | null;
  gatewayReference?: string | null;

  paymentUrl?: string | null;
  qrCodeUrl?: string | null;
  checkoutUrl?: string | null;

  description?: string | null;
  metadata?: Record<string, any> | null;

  paidAt?: Date | null;
  failedAt?: Date | null;
  canceledAt?: Date | null;
  expiredAt?: Date | null;
  refundedAt?: Date | null;

  expiresAt?: Date | null;

  transactions?: PaymentTransactionResult[];

  createdAt: Date;
  updatedAt: Date;
}