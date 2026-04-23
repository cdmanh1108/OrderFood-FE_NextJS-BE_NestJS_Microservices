import type {
  CreateStaffUserRequest,
  DeleteStaffUserResponse,
  ListStaffUsersQuery,
  PaginatedStaffUsersResponse,
  StaffUserApiModel,
  UpdateStaffUserRequest,
} from "@/types/api";
import { httpService } from "../http/http-client";

const STAFF_USERS_ENDPOINT = "/users/staff";

export const staffUserApi = {
  list(query?: ListStaffUsersQuery): Promise<PaginatedStaffUsersResponse> {
    return httpService.get<PaginatedStaffUsersResponse>(STAFF_USERS_ENDPOINT, {
      params: query,
    });
  },

  getById(id: string): Promise<StaffUserApiModel> {
    return httpService.get<StaffUserApiModel>(`${STAFF_USERS_ENDPOINT}/${id}`);
  },

  create(payload: CreateStaffUserRequest): Promise<StaffUserApiModel> {
    return httpService.post<StaffUserApiModel, CreateStaffUserRequest>(
      STAFF_USERS_ENDPOINT,
      payload,
    );
  },

  update(id: string, payload: UpdateStaffUserRequest): Promise<StaffUserApiModel> {
    return httpService.patch<StaffUserApiModel, UpdateStaffUserRequest>(
      `${STAFF_USERS_ENDPOINT}/${id}`,
      payload,
    );
  },

  delete(id: string): Promise<DeleteStaffUserResponse> {
    return httpService.delete<DeleteStaffUserResponse>(`${STAFF_USERS_ENDPOINT}/${id}`);
  },
};
