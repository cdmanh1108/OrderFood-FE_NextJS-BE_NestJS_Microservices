export interface CreateDeliveryTaskCommand {
  orderId: string;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  note?: string;
}
