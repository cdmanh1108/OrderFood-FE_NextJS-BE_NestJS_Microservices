import { CategoryDetailResult } from './category-detail.result';

export interface PaginatedCategoriesResult {
  items: CategoryDetailResult[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
