import { IsBoolean, IsOptional } from 'class-validator';

export class SetDefaultAddressRequestDto {
  @IsOptional()
  @IsBoolean({ message: 'isDefault phải là boolean' })
  isDefault?: boolean = true;
}
