import { FulfillmentStatus } from '../../enums/fulfillment-status.enum';
import { OrderChannel } from '../../enums/order-channel.enum';
import { OrderSource } from '../../enums/order-source.enum';
import { OrderStatus } from '../../enums/order-status.enum';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { OrderItemResult } from './order-item.result';
import { PricingSnapshotResult } from './pricing-snapshot.result';
import { ShippingAddressSnapshotResult } from './shipping-address-snapshot.result';

export interface OrderDetailResult {
  id: string;
  code: string;
  userId: string | null;
  channel: OrderChannel;
  source: OrderSource;
  tableId: string | null;
  tableSessionId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  note: string | null;
  items: OrderItemResult[];
  pricingSnapshot: PricingSnapshotResult | null;
  shippingAddress: ShippingAddressSnapshotResult | null;
  placedAt: Date | null;
  confirmedAt: Date | null;
  completedAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
