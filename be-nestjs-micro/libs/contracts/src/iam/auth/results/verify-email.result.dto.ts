import { UserRole } from '../enums/user-role.enum';

export interface VerifyEmailResultDto {
  isEmailVerified: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
    isEmailVerified: boolean;
  };
}

