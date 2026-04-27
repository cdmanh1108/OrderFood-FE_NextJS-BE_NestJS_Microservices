import type { OrderChannel, OrderSource } from "./cart.type";
import type { PaginationParams } from "./common.type";

export type OrderStatus =
  | "DRAFT"
  | "PLACED"
  | "CONFIRMED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELED";

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type FulfillmentStatus =
  | "NONE"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "SHIPPING"
  | "DELIVERED"
  | "FAILED";

export interface OrderItemApiModel {
  id: string;
  menuItemId: string;
  menuItemName: string;
  menuItemImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  note: string | null;
}

export interface PricingSnapshotApiModel {
  itemsSubtotal: number;
  modifiersTotal: number;
  discountTotal: number;
  shippingFee: number;
  serviceFee: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
}

export interface ShippingAddressSnapshotApiModel {
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  street: string | null;
  detail: string | null;
}

export interface OrderApiModel {
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
  items: OrderItemApiModel[];
  pricingSnapshot: PricingSnapshotApiModel | null;
  shippingAddress: ShippingAddressSnapshotApiModel | null;
  placedAt: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListOrdersRequest extends PaginationParams {
  keyword?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  fulfillmentStatus?: FulfillmentStatus;
}

export interface PaginatedOrdersResponse {
  items: OrderApiModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderItemDto {
  menuItemId: string;
  menuItemName: string;
  menuItemImageUrl?: string;
  unitPrice: number;
  quantity: number;
  note?: string;
}

export interface OrderShippingAddressDto {
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  street?: string;
  detail?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateOrderRequest {
  channel: OrderChannel;
  source: OrderSource;
  tableId?: string;
  tableSessionId?: string;
  note?: string;
  items: OrderItemDto[];
  shippingAddress?: OrderShippingAddressDto;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface CancelOrderRequest {
  cancelReason?: string;
}

export interface CreateOrderResponse {
  id: string;
  code: string;
}

export interface DeleteOrderResponse {
  success: boolean;
}
