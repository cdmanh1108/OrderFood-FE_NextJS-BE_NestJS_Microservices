import { FulfillmentStatus } from '@app/contracts/ordering/enums/fulfillment-status.enum';
import { OrderChannel } from '@app/contracts/ordering/enums/order-channel.enum';
import { OrderSource } from '@app/contracts/ordering/enums/order-source.enum';
import { OrderStatus } from '@app/contracts/ordering/enums/order-status.enum';
import { PaymentStatus } from '@app/contracts/ordering/enums/payment-status.enum';
import { OrderItemResponseDto } from './order-item.response.dto';
import { PricingSnapshotResponseDto } from './pricing-snapshot.response.dto';
import { ShippingAddressSnapshotResponseDto } from './shipping-address-snapshot.response.dto';

export class OrderResponseDto {
  id!: string;
  code!: string;
  userId!: string | null;
  channel!: OrderChannel;
  source!: OrderSource;
  tableId!: string | null;
  tableSessionId!: string | null;
  status!: OrderStatus;
  paymentStatus!: PaymentStatus;
  fulfillmentStatus!: FulfillmentStatus;
  note!: string | null;
  items!: OrderItemResponseDto[];
  pricingSnapshot!: PricingSnapshotResponseDto | null;
  shippingAddress!: ShippingAddressSnapshotResponseDto | null;
  placedAt!: Date | null;
  confirmedAt!: Date | null;
  completedAt!: Date | null;
  canceledAt!: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
