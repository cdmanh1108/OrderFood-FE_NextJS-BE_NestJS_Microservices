import { OrderStatus } from '@app/contracts/ordering/enums/order-status.enum';
import { PaymentMethod } from '@app/contracts/payment/enums/payment-method.enum';
import { PaymentStatus } from '@app/contracts/payment/enums/payment-status.enum';

export class PlaceOrderResponseDto {
  orderId!: string;
  orderCode!: string;
  orderStatus!: OrderStatus;
  paymentId!: string;
  paymentMethod!: PaymentMethod;
  paymentStatus!: PaymentStatus;
  checkoutUrl?: string | null;
  amount!: number;
  currency!: string;
  createdAt!: Date;
}
