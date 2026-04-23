import { UserRole } from '../enums/user-role.enum';

export interface RegisterResultDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
  };
}
