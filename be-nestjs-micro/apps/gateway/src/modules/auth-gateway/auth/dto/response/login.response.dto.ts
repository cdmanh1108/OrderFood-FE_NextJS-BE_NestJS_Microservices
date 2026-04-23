import { UserRole } from '@app/contracts/iam/auth/enums/user-role.enum';

export class LoginResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
  };
}
