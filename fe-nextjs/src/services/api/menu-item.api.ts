import type {
  CreateMenuItemRequest,
  DeleteMenuItemResponse,
  GetMenuItemsRequest,
  ListMenuItemsRequest,
  MenuItemApiModel,
  MenuItemSimpleApiModel,
  PaginatedMenuItemsResponse,
  SetMenuItemActiveRequest,
  UpdateMenuItemRequest,
} from "@/types/api";
import { httpService } from "../http/http-client";

const MENU_ITEM_ENDPOINT = "/menu-items";

export const menuItemApi = {
  list(query?: ListMenuItemsRequest): Promise<PaginatedMenuItemsResponse> {
    return httpService.get<PaginatedMenuItemsResponse>(MENU_ITEM_ENDPOINT, {
      params: query,
    });
  },

  menu(query?: GetMenuItemsRequest): Promise<MenuItemSimpleApiModel[]> {
    return httpService.get<MenuItemSimpleApiModel[]>(`${MENU_ITEM_ENDPOINT}/menu`, {
      params: query,
    });
  },

  featured(): Promise<MenuItemSimpleApiModel[]> {
    return httpService.get<MenuItemSimpleApiModel[]>(`${MENU_ITEM_ENDPOINT}/featured`);
  },

  getById(id: string): Promise<MenuItemApiModel> {
    return httpService.get<MenuItemApiModel>(`${MENU_ITEM_ENDPOINT}/${id}`);
  },

  create(payload: CreateMenuItemRequest): Promise<MenuItemApiModel> {
    return httpService.post<MenuItemApiModel, CreateMenuItemRequest>(
      MENU_ITEM_ENDPOINT,
      payload,
    );
  },

  update(id: string, payload: UpdateMenuItemRequest): Promise<MenuItemApiModel> {
    return httpService.patch<MenuItemApiModel, UpdateMenuItemRequest>(
      `${MENU_ITEM_ENDPOINT}/${id}`,
      payload,
    );
  },

  setActive(id: string, payload: SetMenuItemActiveRequest): Promise<MenuItemApiModel> {
    return httpService.patch<MenuItemApiModel, SetMenuItemActiveRequest>(
      `${MENU_ITEM_ENDPOINT}/${id}/active`,
      payload,
    );
  },

  delete(id: string): Promise<DeleteMenuItemResponse> {
    return httpService.delete<DeleteMenuItemResponse>(`${MENU_ITEM_ENDPOINT}/${id}`);
  },
};
