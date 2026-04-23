import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUploadUrlRequestDto {
  @IsString({ message: 'fileName must be a string' })
  @MaxLength(255, { message: 'fileName max length is 255' })
  fileName!: string;

  @IsString({ message: 'contentType must be a string' })
  @IsIn(['image/jpeg', 'image/png', 'image/webp', 'image/jpg'], {
    message: 'contentType is not supported',
  })
  contentType!: string;

  @IsOptional()
  @IsString({ message: 'folder must be a string' })
  @MaxLength(100, { message: 'folder max length is 100' })
  folder?: string;
}
