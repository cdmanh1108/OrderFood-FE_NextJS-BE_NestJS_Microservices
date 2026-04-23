import type { SortDirection } from "./common.type";

export interface CategoryApiModel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryFormValues {
  name: string;
  slug: string;
  description: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  sortOrder?: number;
}

export interface SetCategoryActiveRequest {
  isActive: boolean;
}

export interface ListCategoriesRequest {
  keyword?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "name" | "sortOrder";
  sortOrder?: SortDirection;
}

export interface PaginatedCategoriesResponse {
  items: CategoryApiModel[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface DeleteCategoryResponse {
  id: string;
  deleted: boolean;
}
