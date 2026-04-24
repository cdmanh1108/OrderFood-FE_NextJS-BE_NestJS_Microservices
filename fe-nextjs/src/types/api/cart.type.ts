export type OrderChannel = "DINE_IN" | "ONLINE";
export type OrderSource = "QR" | "WEB" | "MOBILE" | "POS";
export type CartStatus = "ACTIVE" | "CHECKED_OUT" | "ABANDONED" | "EXPIRED";

export interface AddressApiModel {
  id: string;
  userId: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  street: string | null;
  detail: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItemApiModel {
  id: string;
  menuItemId: string;
  menuItemName: string;
  menuItemImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CartApiModel {
  id: string;
  userId: string | null;
  channel: OrderChannel;
  source: OrderSource;
  tableId: string | null;
  tableSessionId: string | null;
  addressId: string | null;
  address: AddressApiModel | null;
  status: CartStatus;
  note: string | null;
  items: CartItemApiModel[];
  itemsCount: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetActiveCartRequest {
  userId?: string;
  channel: OrderChannel;
  source: OrderSource;
  tableId?: string;
  tableSessionId?: string;
  createIfMissing?: boolean;
}

export interface AddCartItemRequest {
  cartId: string;
  menuItemId: string;
  menuItemName: string;
  menuItemImageUrl?: string;
  unitPrice: number;
  quantity?: number;
  note?: string;
}

export interface UpdateCartItemRequest {
  cartId: string;
  itemId: string;
  quantity?: number;
  note?: string;
}

export interface RemoveCartItemRequest {
  cartId: string;
  itemId: string;
}

export interface RemoveCartItemResponse {
  cartId: string;
  itemId: string;
  removed: boolean;
  remainingItems: number;
}

export interface SetCartAddressRequest {
  cartId: string;
  addressId?: string;
}

export interface SetCartAddressResponse {
  cartId: string;
  addressId: string | null;
}

export interface SetCartNoteRequest {
  cartId: string;
  note?: string;
}

export interface SetCartNoteResponse {
  cartId: string;
  note: string | null;
}

export interface ClearCartRequest {
  cartId: string;
}

export interface ClearCartResponse {
  cartId: string;
  cleared: boolean;
}
