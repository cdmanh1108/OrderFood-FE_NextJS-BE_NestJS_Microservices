import { UserRole } from '../../auth/enums/user-role.enum';

export interface StaffUserDetailResult {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
