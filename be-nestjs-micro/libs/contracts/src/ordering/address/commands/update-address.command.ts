export interface UpdateAddressCommand {
  id: string;
  userId: string;
  receiverName?: string;
  receiverPhone?: string;
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
  detail?: string;
  latitude?: number;
  longitude?: number;
}
