export interface PricingPreviewResult {
  itemsSubtotal: number;
  modifiersTotal: number;
  discountTotal: number;
  shippingFee: number;
  serviceFee: number;
  taxTotal: number;
  grandTotal: number;
  currency: string;
}
