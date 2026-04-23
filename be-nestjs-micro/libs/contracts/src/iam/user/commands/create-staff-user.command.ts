import { UserRole } from '../../auth/enums/user-role.enum';

export interface CreateStaffUserCommand {
  actorRole: UserRole;
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
}
