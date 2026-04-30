import { IsUUID } from 'class-validator';

export class PaymentIdParamsDto {
  @IsUUID()
  id: string;
}