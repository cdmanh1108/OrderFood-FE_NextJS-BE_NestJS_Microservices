import { PaymentMethod } from '../enums/payment-method.enum';

export class CreatePaymentCommand {
  orderId: string;
  orderCode?: string | null;

  method: PaymentMethod;

  amount: string;
  currency?: string;

  description?: string | null;
  metadata?: Record<string, any> | null;

  returnUrl?: string | null;
  cancelUrl?: string | null;

  expiresAt?: Date | string | null;
}
