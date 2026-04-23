import { IsBoolean } from 'class-validator';

export class SetCategoryActiveRequestDto {
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive!: boolean;
}
