import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DeliveryTaskStatus } from '@app/contracts/delivery/enums/delivery-task-status.enum';

export class UpdateTaskStatusDto {
  @IsNotEmpty()
  @IsEnum(DeliveryTaskStatus)
  status: DeliveryTaskStatus;

  @IsOptional()
  @IsString()
  note?: string;
}
