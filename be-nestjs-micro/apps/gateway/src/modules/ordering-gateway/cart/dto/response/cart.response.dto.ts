import { CartStatus } from '@app/contracts/ordering/enums/cart-status.enum';
import { OrderChannel } from '@app/contracts/ordering/enums/order-channel.enum';
import { OrderSource } from '@app/contracts/ordering/enums/order-source.enum';
import { AddressResponseDto } from '../../../address/dto/response/address.response.dto';
import { CartItemResponseDto } from './cart-item.response.dto';

export class CartResponseDto {
  id!: string;
  userId!: string | null;
  channel!: OrderChannel;
  source!: OrderSource;
  tableId!: string | null;
  tableSessionId!: string | null;
  addressId!: string | null;
  address!: AddressResponseDto | null;
  status!: CartStatus;
  note!: string | null;
  items!: CartItemResponseDto[];
  itemsCount!: number;
  subtotal!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
