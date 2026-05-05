export interface ShipperLocationResult {
  id: string;
  shipperId: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  recordedAt: Date;
}
