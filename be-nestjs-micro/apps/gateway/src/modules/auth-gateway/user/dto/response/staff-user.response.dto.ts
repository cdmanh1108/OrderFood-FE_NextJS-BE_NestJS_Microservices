import { UserRole } from '@app/contracts/iam/auth/enums/user-role.enum';

export class StaffUserResponseDto {
  id!: string;
  email!: string;
  fullName!: string | null;
  phoneNumber!: string | null;
  role!: UserRole;
  createdAt!: Date;
  updatedAt!: Date;
}
