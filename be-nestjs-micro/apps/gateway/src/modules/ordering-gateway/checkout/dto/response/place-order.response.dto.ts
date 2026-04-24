import { FulfillmentStatus } from '@app/contracts/ordering/enums/fulfillment-status.enum';
import { OrderStatus } from '@app/contracts/ordering/enums/order-status.enum';
import { PaymentStatus } from '@app/contracts/ordering/enums/payment-status.enum';

export class PlaceOrderResponseDto {
  orderId!: string;
  orderCode!: string;
  status!: OrderStatus;
  paymentStatus!: PaymentStatus;
  fulfillmentStatus!: FulfillmentStatus;
  grandTotal!: number;
  createdAt!: Date;
}
