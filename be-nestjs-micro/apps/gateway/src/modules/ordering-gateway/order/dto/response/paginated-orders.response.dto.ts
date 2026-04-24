import { OrderResponseDto } from './order.response.dto';

export class PaginatedOrdersResponseDto {
  items!: OrderResponseDto[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
