import { IsObject, IsOptional, IsString } from 'class-validator';

export class ConfirmPaymentRequestDto {
  @IsOptional()
  @IsString()
  gatewayTransactionId?: string;

  @IsOptional()
  @IsString()
  gatewayReference?: string;

  @IsOptional()
  @IsObject()
  rawPayload?: Record<string, any>;
}