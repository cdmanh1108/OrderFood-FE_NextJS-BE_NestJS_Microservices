import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class DeleteAddressRequestDto {
  @IsUUID('4', { message: 'addressId không hợp lệ' })
  id!: string;

  @IsOptional()
  @IsString({ message: 'userId phải là chuỗi' })
  @Matches(/^c[a-z0-9]{24}$/, { message: 'userId không hợp lệ' })
  userId?: string;
}
