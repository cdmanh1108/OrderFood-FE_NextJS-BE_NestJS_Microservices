export interface CreateAddressCommand {
  userId: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  street?: string;
  detail?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}
