import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';

export class ListPaymentsCommand {
  page?: number;
  limit?: number;

  orderId?: string;
  orderCode?: string;

  method?: PaymentMethod;
  status?: PaymentStatus;

  gateway?: string;
}