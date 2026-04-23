import { IsEmail, IsString, MinLength } from 'class-validator';

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
}
