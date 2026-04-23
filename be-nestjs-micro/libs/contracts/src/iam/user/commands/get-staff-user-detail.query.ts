import { UserRole } from '../../auth/enums/user-role.enum';

export interface GetStaffUserDetailQuery {
  actorRole: UserRole;
  id: string;
}
