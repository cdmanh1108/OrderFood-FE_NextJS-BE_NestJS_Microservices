import { UserRole } from '@app/contracts/iam/auth/enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  email: string;
}
