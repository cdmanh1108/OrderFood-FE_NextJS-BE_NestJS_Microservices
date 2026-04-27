import { OrderChannel } from '../../enums/order-channel.enum';
import { OrderSource } from '../../enums/order-source.enum';

export class CreateOrderCommand {
  userId?: string;
  channel: OrderChannel;
  source: OrderSource;
  tableId?: string;
  tableSessionId?: string;
  note?: string;
  items: {
    menuItemId: string;
    menuItemName: string;
    menuItemImageUrl?: string;
    unitPrice: number;
    quantity: number;
    note?: string;
  }[];
  shippingAddress?: {
    receiverName: string;
    receiverPhone: string;
    province: string;
    district: string;
    ward: string;
    street?: string;
    detail?: string;
    latitude?: number;
    longitude?: number;
  };
}
