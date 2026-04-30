import { IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateRefundRequestDto {
  @IsUUID()
  paymentId: string;

  @IsString()
  amount: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
