import { OrderStatus } from '@app/contracts/ordering/enums/order-status.enum';

export class CancelOrderResponseDto {
  id!: string;
  status!: OrderStatus;
  canceledAt!: Date;
}
