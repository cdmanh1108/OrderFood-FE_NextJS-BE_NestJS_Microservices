import type { SortDirection } from "./common.type";

export interface MenuItemApiModel {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  image?: string | null;
  sku?: string | null;
  isActive: boolean;
  isAvailable: boolean;
  sortOrder: number;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemSimpleApiModel {
  id: string;
  image?: string | null;
  name: string;
  description?: string | null;
  price: number;
}

export interface CreateMenuItemRequest {
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

export interface UpdateMenuItemRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  image?: string;
  sku?: string;
  isAvailable?: boolean;
  sortOrder?: number;
  categoryId?: string;
}

export interface SetMenuItemActiveRequest {
  isActive: boolean;
}

export interface ListMenuItemsRequest {
  keyword?: string;
  categoryId?: string;
  isActive?: boolean;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "price" | "sortOrder";
  sortOrder?: SortDirection;
}

export interface GetMenuItemsRequest {
  keyword?: string;
  categoryId?: string;
  limit?: number;
}

export interface PaginatedMenuItemsResponse {
  items: MenuItemApiModel[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface DeleteMenuItemResponse {
  id: string;
  deleted: boolean;
}
