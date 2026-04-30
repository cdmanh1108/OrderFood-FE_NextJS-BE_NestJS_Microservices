import { PaymentResponseDto } from './payment.response.dto';

export class ListPaymentsResponseDto {
  items: PaymentResponseDto[];
  page: number;
  limit: number;
  total: number;
}