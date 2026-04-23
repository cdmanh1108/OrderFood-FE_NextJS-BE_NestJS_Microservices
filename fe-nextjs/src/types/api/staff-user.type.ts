export type IamUserRole = "ADMIN" | "STAFF" | "USER";

export interface StaffUserApiModel {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  role: IamUserRole;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffUserRequest {
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
}

export interface UpdateStaffUserRequest {
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  password?: string;
}

export interface ListStaffUsersQuery {
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedStaffUsersResponse {
  items: StaffUserApiModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DeleteStaffUserResponse {
  id: string;
  deleted: boolean;
}
