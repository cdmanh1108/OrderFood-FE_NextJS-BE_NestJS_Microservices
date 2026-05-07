export enum VehicleType {
  MOTORBIKE = "MOTORBIKE",
  BICYCLE = "BICYCLE",
  CAR = "CAR",
}

export interface ShipperDetailApiModel {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  vehicleType: VehicleType;
  licensePlate: string;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateShipperRequest {
  userId: string;
  fullName: string;
  phoneNumber: string;
  vehicleType: VehicleType;
  licensePlate: string;
  avatarUrl?: string;
}

export interface UpdateShipperRequest {
  fullName?: string;
  phoneNumber?: string;
  vehicleType?: VehicleType;
  licensePlate?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface ListShippersQuery {
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedShippersResponse {
  items: ShipperDetailApiModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShipperLocationApiModel {
  id: string;
  shipperId: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  recordedAt: string;
}
