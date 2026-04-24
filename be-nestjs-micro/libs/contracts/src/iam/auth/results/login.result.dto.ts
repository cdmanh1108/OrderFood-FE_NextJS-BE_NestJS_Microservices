import { UserRole } from '../enums/user-role.enum';

export interface LoginResultDto {
  isEmailVerified: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    isEmailVerified: boolean;
  };
}
