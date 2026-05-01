import { RefundResponseDto } from './refund.response.dto';

export class ListRefundsResponseDto {
  items: RefundResponseDto[];
  page: number;
  limit: number;
  total: number;
}
