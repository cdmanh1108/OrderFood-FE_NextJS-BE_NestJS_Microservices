export class AddressResponseDto {
  id!: string;
  userId!: string;
  receiverName!: string;
  receiverPhone!: string;
  province!: string;
  district!: string;
  ward!: string;
  street!: string | null;
  detail!: string | null;
  latitude!: number | null;
  longitude!: number | null;
  isDefault!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
