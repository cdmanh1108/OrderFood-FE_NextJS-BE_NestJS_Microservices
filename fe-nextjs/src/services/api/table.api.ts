import type {
  TableApiModel,
  PaginatedTablesResponse,
  ListTablesRequest,
  CreateTableRequest,
  UpdateTableRequest,
} from "@/types/api";
import { httpService } from "../http/http-client";

const TABLE_ENDPOINT = "/dinein/tables";

export const tableApi = {
  list(query?: ListTablesRequest): Promise<PaginatedTablesResponse> {
    return httpService.get<PaginatedTablesResponse>(TABLE_ENDPOINT, {
      params: query,
    });
  },

  getById(id: string): Promise<TableApiModel> {
    return httpService.get<TableApiModel>(`${TABLE_ENDPOINT}/${id}`);
  },

  create(payload: CreateTableRequest): Promise<TableApiModel> {
    return httpService.post<TableApiModel, CreateTableRequest>(
      TABLE_ENDPOINT,
      payload,
    );
  },

  update(id: string, payload: UpdateTableRequest): Promise<TableApiModel> {
    return httpService.patch<TableApiModel, UpdateTableRequest>(
      `${TABLE_ENDPOINT}/${id}`,
      payload,
    );
  },

  delete(id: string): Promise<{ success: boolean }> {
    return httpService.delete<{ success: boolean }>(
      `${TABLE_ENDPOINT}/${id}`,
    );
  },
};
