import type {
  CategoryApiModel,
  CreateCategoryRequest,
  DeleteCategoryResponse,
  ListCategoriesRequest,
  MenuCategorySimpleApiModel,
  PaginatedCategoriesResponse,
  SetCategoryActiveRequest,
  UpdateCategoryRequest,
} from "@/types/api";
import { httpService } from "../http/http-client";

const CATEGORY_ENDPOINT = "/category";

export const categoryApi = {
  list(query?: ListCategoriesRequest): Promise<PaginatedCategoriesResponse> {
    return httpService.get<PaginatedCategoriesResponse>(CATEGORY_ENDPOINT, {
      params: query,
    });
  },

  menuCategories(): Promise<MenuCategorySimpleApiModel[]> {
    return httpService.get<MenuCategorySimpleApiModel[]>(
      `${CATEGORY_ENDPOINT}/menu-categories`,
    );
  },

  getById(id: string): Promise<CategoryApiModel> {
    return httpService.get<CategoryApiModel>(`${CATEGORY_ENDPOINT}/${id}`);
  },

  create(payload: CreateCategoryRequest): Promise<CategoryApiModel> {
    return httpService.post<CategoryApiModel, CreateCategoryRequest>(
      CATEGORY_ENDPOINT,
      payload,
    );
  },

  update(id: string, payload: UpdateCategoryRequest): Promise<CategoryApiModel> {
    return httpService.patch<CategoryApiModel, UpdateCategoryRequest>(
      `${CATEGORY_ENDPOINT}/${id}`,
      payload,
    );
  },

  setActive(id: string, payload: SetCategoryActiveRequest): Promise<CategoryApiModel> {
    return httpService.patch<CategoryApiModel, SetCategoryActiveRequest>(
      `${CATEGORY_ENDPOINT}/${id}/active`,
      payload,
    );
  },

  delete(id: string): Promise<DeleteCategoryResponse> {
    return httpService.delete<DeleteCategoryResponse>(`${CATEGORY_ENDPOINT}/${id}`);
  },
};
