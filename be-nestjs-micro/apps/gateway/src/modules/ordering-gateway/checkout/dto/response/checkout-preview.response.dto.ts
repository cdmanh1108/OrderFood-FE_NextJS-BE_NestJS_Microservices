import { AddressResponseDto } from '../../../address/dto/response/address.response.dto';
import { CartResponseDto } from '../../../cart/dto/response/cart.response.dto';
import { PricingPreviewResponseDto } from './pricing-preview.response.dto';

export class CheckoutPreviewResponseDto {
  cart!: CartResponseDto;
  pricing!: PricingPreviewResponseDto;
  shippingAddress!: AddressResponseDto | null;
}
