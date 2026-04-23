export class MenuItemResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  description?: string | null;
  price!: number;
  image?: string | null;
  sku?: string | null;
  isActive!: boolean;
  isAvailable!: boolean;
  sortOrder!: number;
  categoryId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
