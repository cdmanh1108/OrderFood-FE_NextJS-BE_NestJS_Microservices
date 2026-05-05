import { VehicleType } from '../../enums/delivery-task-status.enum';

export interface ShipperDetailResult {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  vehicleType: VehicleType;
  licensePlate: string;
  isActive: boolean;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedShippersResult {
  items: ShipperDetailResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
