export class PricingSnapshotResponseDto {
  id!: string;
  orderId!: string;
  itemsSubtotal!: number;
  modifiersTotal!: number;
  discountTotal!: number;
  shippingFee!: number;
  serviceFee!: number;
  taxTotal!: number;
  grandTotal!: number;
  currency!: string;
  createdAt!: Date;
}
