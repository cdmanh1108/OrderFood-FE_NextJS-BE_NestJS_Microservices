import { IsEnum } from 'class-validator';

export enum PaymentMethodDto {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class CloseSessionRequestDto {
  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;
}
