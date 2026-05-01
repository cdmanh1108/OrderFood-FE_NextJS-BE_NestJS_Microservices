import { httpService } from "../http/http-client";
import type { PaymentMethod } from "./payment.api";

export interface CheckoutItemPayload {
  menuItemId: string;
  quantity: number;
  unitPrice: number;
}

export interface CalculateCheckoutPayload {
  items: CheckoutItemPayload[];
  shippingAddressId?: string;
  promoCode?: string;
}

export interface CheckoutPricingResponse {
  itemsSubtotal: number;
  shippingFee: number;
  discountTotal: number;
  serviceFee: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
}

export interface PlaceOrderItemPayload {
  menuItemId: string;
  menuItemName: string;
  menuItemImageUrl?: string;
  unitPrice: number;
  quantity: number;
  note?: string;
}

export interface PlaceOrderShippingAddressPayload {
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

export interface CheckoutPlaceOrderPayload {
  items: PlaceOrderItemPayload[];
  shippingAddress?: PlaceOrderShippingAddressPayload;
  note?: string;
  promoCode?: string;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutPlaceOrderResponse {
  orderId: string;
  orderCode: string;
  orderStatus: string;
  paymentId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  checkoutUrl?: string | null;
  amount: number;
  currency: string;
  createdAt: string;
}

export const checkoutApi = {
  calculate: async (
    payload: CalculateCheckoutPayload,
  ): Promise<CheckoutPricingResponse> => {
    return await httpService.post(
      '/ordering/checkout/calculate',
      payload,
    );
  },

  checkout: async (
    payload: CheckoutPlaceOrderPayload,
  ): Promise<CheckoutPlaceOrderResponse> => {
    return await httpService.post('/ordering/checkout', payload);
  },
};
