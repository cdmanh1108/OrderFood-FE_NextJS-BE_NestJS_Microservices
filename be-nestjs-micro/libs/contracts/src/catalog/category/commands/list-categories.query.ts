export interface ListCategoriesQuery {
  keyword?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
}
