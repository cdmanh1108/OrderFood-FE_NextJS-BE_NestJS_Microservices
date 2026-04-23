export interface ListMenuItemsQuery {
  categoryId?: string;
  keyword?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'price' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
}
