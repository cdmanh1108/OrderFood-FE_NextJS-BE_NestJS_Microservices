import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateAddressRequestDto {
  @IsString({ message: 'Tên người nhận phải là chuỗi' })
  @MaxLength(120, { message: 'Tên người nhận tối đa 120 ký tự' })
  receiverName!: string;

  @IsString({ message: 'Số điện thoại người nhận phải là chuỗi' })
  @MaxLength(20, { message: 'Số điện thoại người nhận tối đa 20 ký tự' })
  receiverPhone!: string;

  @IsString({ message: 'Tỉnh/Thành phố phải là chuỗi' })
  @MaxLength(120, { message: 'Tỉnh/Thành phố tối đa 120 ký tự' })
  province!: string;

  @IsString({ message: 'Quận/Huyện phải là chuỗi' })
  @MaxLength(120, { message: 'Quận/Huyện tối đa 120 ký tự' })
  district!: string;

  @IsString({ message: 'Phường/Xã phải là chuỗi' })
  @MaxLength(120, { message: 'Phường/Xã tối đa 120 ký tự' })
  ward!: string;

  @IsOptional()
  @IsString({ message: 'Đường phải là chuỗi' })
  @MaxLength(255, { message: 'Đường tối đa 255 ký tự' })
  street?: string;

  @IsOptional()
  @IsString({ message: 'Chi tiết địa chỉ phải là chuỗi' })
  detail?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Vĩ độ phải là số' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Kinh độ phải là số' })
  longitude?: number;

  @IsOptional()
  @IsBoolean({ message: 'isDefault phải là boolean' })
  isDefault?: boolean;
}
