import { StaffUserResponseDto } from './staff-user.response.dto';

export class PaginatedStaffUsersResponseDto {
  items!: StaffUserResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
