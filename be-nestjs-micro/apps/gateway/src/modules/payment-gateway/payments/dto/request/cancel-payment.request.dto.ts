import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelPaymentRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;

  @IsOptional()
  @IsObject()
  rawPayload?: Record<string, any>;
}