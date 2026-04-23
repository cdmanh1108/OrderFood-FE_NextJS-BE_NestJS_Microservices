import { UserRole } from '../enums/user-role.enum';

export interface LoginResultDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
  };
}
