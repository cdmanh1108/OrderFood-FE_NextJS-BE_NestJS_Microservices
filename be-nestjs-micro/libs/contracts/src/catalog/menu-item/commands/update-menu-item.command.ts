export interface UpdateMenuItemCommand {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  image?: string;
  sku?: string;
  sortOrder?: number;
  categoryId?: string;
  isAvailable?: boolean;
}
