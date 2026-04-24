export interface PreviewCheckoutCommand {
  cartId: string;
  discountTotal?: number;
  shippingFee?: number;
  serviceFee?: number;
  taxTotal?: number;
}
