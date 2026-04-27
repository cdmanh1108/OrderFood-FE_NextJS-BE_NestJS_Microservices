export class CheckoutPricingResult {
  itemsSubtotal!: number;
  shippingFee!: number;
  discountTotal!: number;
  serviceFee!: number;
  taxTotal!: number;
  grandTotal!: number;
  currency!: string;
}
