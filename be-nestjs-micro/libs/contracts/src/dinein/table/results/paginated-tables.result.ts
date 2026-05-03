import { TableDetailResult } from './table-detail.result';

export interface PaginatedTablesResult {
  items: TableDetailResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
