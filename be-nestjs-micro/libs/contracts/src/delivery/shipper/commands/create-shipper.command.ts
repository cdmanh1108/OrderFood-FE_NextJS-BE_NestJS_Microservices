import { VehicleType } from "../../enums/delivery-task-status.enum";

export interface CreateShipperCommand {
  userId: string;
  fullName: string;
  phoneNumber: string;
  vehicleType: VehicleType;
  licensePlate: string;
  avatarUrl?: string;
}
