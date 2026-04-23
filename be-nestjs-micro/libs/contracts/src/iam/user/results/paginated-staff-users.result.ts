import { StaffUserDetailResult } from './staff-user-detail.result';

export interface PaginatedStaffUsersResult {
  items: StaffUserDetailResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
