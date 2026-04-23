import { UserRole } from '../../auth/enums/user-role.enum';

export interface DeleteStaffUserCommand {
  actorRole: UserRole;
  id: string;
}
