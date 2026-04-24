import { AddressDetailResult } from '../../address/results/address-detail.result';
import { CartDetailResult } from '../../cart/results/cart-detail.result';
import { PricingPreviewResult } from './pricing-preview.result';

export interface CheckoutPreviewResult {
  cart: CartDetailResult;
  pricing: PricingPreviewResult;
  shippingAddress: AddressDetailResult | null;
}
