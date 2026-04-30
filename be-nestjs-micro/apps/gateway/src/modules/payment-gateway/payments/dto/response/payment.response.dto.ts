import { PaymentMethod } from '@app/contracts/payment/enums/payment-method.enum';
import { PaymentTransactionResponseDto } from './payment-transaction.response.dto';
import { PaymentStatus } from '@app/contracts/payment/enums/payment-status.enum';

export class PaymentResponseDto {
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

  transactions?: PaymentTransactionResponseDto[];

  createdAt: Date;
  updatedAt: Date;
}