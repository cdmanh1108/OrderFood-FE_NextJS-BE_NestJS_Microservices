import { OrderStatus } from '../../enums/order-status.enum';

export interface CancelOrderResult {
  id: string;
  status: OrderStatus;
  canceledAt: Date;
}
