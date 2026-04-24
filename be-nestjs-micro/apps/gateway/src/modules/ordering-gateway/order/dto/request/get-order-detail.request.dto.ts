import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';

export class GetOrderDetailRequestDto {
  @IsUUID('4', { message: 'id is invalid' })
  id!: string;

  @IsOptional()
  @IsString({ message: 'userId phai la chuoi' })
  @Matches(/^c[a-z0-9]{24}$/, { message: 'userId khong hop le' })
  userId?: string;
}
