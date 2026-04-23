import { IsBoolean } from 'class-validator';

export class SetMenuItemActiveRequestDto {
  @IsBoolean({ message: 'isActive must be boolean' })
  isActive!: boolean;
}
