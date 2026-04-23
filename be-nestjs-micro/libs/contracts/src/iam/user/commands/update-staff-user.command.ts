import { UserRole } from '../../auth/enums/user-role.enum';

export interface UpdateStaffUserCommand {
  actorRole: UserRole;
  id: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  password?: string;
}
