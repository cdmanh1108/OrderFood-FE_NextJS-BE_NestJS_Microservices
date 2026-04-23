export interface CreateMenuItemCommand {
  name: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
  sku?: string;
  sortOrder?: number;
  isActive?: boolean;
  isAvailable?: boolean;
  categoryId: string;
}
