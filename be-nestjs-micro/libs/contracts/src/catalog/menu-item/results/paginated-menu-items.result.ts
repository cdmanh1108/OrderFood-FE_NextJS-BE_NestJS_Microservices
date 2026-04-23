import { MenuItemDetailResult } from './menu-item-detail.result';

export interface PaginatedMenuItemsResult {
  items: MenuItemDetailResult[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
