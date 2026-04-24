import { UserRole } from '@app/contracts/iam/auth/enums/user-role.enum';

export class VerifyEmailResponseDto {
  isEmailVerified!: boolean;
  accessToken!: string | null;
  refreshToken!: string | null;
  user!: {
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
    isEmailVerified: boolean;
  };
}

