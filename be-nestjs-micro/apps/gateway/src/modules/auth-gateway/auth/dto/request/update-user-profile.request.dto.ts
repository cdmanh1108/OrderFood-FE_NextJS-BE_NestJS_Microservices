import { IsOptional, IsString } from 'class-validator';

export class UpdateUserProfileRequestDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
