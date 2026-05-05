import { VehicleType } from "../../enums/delivery-task-status.enum";

export interface UpdateShipperCommand {
  id: string;
  fullName?: string;
  phoneNumber?: string;
  vehicleType?: VehicleType;
  licensePlate?: string;
  avatarUrl?: string;
  isActive?: boolean;
}
