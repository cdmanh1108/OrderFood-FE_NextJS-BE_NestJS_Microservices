import { CategoryResponseDto } from './category.response.dto';

export class PaginatedCategoriesResponseDto {
  items!: CategoryResponseDto[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
