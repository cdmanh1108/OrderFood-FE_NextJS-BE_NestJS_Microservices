import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CancelOrderRequestDto {
  @IsUUID('4', { message: 'id is invalid' })
  id!: string;

  @IsOptional()
  @IsUUID('4', { message: 'actorId is invalid' })
  actorId?: string;

  @IsOptional()
  @IsString({ message: 'reason must be a string' })
  reason?: string;
}
