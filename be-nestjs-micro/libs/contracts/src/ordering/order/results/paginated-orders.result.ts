import { OrderDetailResult } from './order-detail.result';

export interface PaginatedOrdersResult {
  items: OrderDetailResult[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
