import { FulfillmentStatus } from '@app/contracts/ordering/enums/fulfillment-status.enum';
import { OrderStatus } from '@app/contracts/ordering/enums/order-status.enum';
import { PaymentStatus } from '@app/contracts/ordering/enums/payment-status.enum';

export class UpdateOrderStatusResponseDto {
  id!: string;
  status!: OrderStatus;
  paymentStatus!: PaymentStatus;
  fulfillmentStatus!: FulfillmentStatus;
  updatedAt!: Date;
}
