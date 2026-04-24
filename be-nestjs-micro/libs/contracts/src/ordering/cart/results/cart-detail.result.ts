import { AddressDetailResult } from '../../address/results/address-detail.result';
import { CartStatus } from '../../enums/cart-status.enum';
import { OrderChannel } from '../../enums/order-channel.enum';
import { OrderSource } from '../../enums/order-source.enum';
import { CartItemResult } from './cart-item.result';

export interface CartDetailResult {
  id: string;
  userId: string | null;
  channel: OrderChannel;
  source: OrderSource;
  tableId: string | null;
  tableSessionId: string | null;
  addressId: string | null;
  address: AddressDetailResult | null;
  status: CartStatus;
  note: string | null;
  items: CartItemResult[];
  itemsCount: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}
