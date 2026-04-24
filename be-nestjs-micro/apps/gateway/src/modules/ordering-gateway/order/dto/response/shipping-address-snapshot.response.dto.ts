export class ShippingAddressSnapshotResponseDto {
  id!: string;
  orderId!: string;
  receiverName!: string;
  receiverPhone!: string;
  province!: string;
  district!: string;
  ward!: string;
  street!: string | null;
  detail!: string | null;
  latitude!: number | null;
  longitude!: number | null;
  createdAt!: Date;
}
