import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitProofDto {
  @IsNotEmpty()
  @IsString()
  mediaFileId: string;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  note?: string;
}
