import { FulfillmentStatus } from '../../enums/fulfillment-status.enum';
import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';

export interface PlaceOrderResult {
  orderId: string;
  orderCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  grandTotal: number;
  createdAt: Date;
}
