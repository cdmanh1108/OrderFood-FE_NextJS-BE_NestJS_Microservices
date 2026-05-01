import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentMethod } from '../../../payment/enums/payment-method.enum';
import { PaymentStatus } from '../../../payment/enums/payment-status.enum';

export interface PlaceOrderResult {
  orderId: string;
  orderCode: string;
  orderStatus: OrderStatus;
  paymentId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  checkoutUrl?: string | null;
  amount: number;
  currency: string;
  createdAt: Date;
}
