import { httpService } from "../http/http-client";

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

export const checkoutApi = {
  calculate: async (
    payload: CalculateCheckoutPayload,
  ): Promise<CheckoutPricingResponse> => {
    return await httpService.post(
      '/ordering/checkout/calculate',
      payload,
    );
  },
};