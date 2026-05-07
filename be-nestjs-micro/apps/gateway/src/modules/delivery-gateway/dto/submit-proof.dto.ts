import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubmitProofDto {
  @IsNotEmpty()
  @IsString()
  mediaFileId: string;

  @IsOptional()
  @IsString()
  note?: string;
}
