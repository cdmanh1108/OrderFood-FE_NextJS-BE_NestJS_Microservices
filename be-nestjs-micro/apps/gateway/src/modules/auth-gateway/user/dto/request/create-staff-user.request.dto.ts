import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@app/contracts/iam/auth/enums/user-role.enum';

export class CreateStaffUserRequestDto {
  @IsEmail()
  email!: string;

  @IsString()
  fullName!: string;

  @IsString()
  phoneNumber!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
