import { UserRole } from '../../auth/enums/user-role.enum';

export interface ListStaffUsersQuery {
  actorRole: UserRole;
  keyword?: string;
  page?: number;
  limit?: number;
}
