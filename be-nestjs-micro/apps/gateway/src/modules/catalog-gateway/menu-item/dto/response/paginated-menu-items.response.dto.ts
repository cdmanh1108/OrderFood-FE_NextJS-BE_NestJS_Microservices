import { MenuItemResponseDto } from './menu-item.response.dto';

export class PaginatedMenuItemsResponseDto {
  items!: MenuItemResponseDto[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
