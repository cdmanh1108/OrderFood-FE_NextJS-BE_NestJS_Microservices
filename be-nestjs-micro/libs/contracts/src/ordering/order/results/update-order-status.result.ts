import { FulfillmentStatus } from '../../enums/fulfillment-status.enum';
import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';

export interface UpdateOrderStatusResult {
  id: string;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
  updatedAt: Date;
}
