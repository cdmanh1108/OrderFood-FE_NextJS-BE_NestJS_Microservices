import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { VehicleType } from '@app/contracts/delivery/enums/delivery-task-status.enum';

export class CreateShipperDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsNotEmpty()
  @IsString()
  licensePlate: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
