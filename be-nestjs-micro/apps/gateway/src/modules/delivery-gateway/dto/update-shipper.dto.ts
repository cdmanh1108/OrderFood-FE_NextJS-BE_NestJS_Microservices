import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { VehicleType } from '@app/contracts/delivery/enums/delivery-task-status.enum';

export class UpdateShipperDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
