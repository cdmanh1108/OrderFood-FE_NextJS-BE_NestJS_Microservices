import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ConfirmWebhookUrlDto {
  @IsNotEmpty()
  @IsString()
  @IsUrl({ require_tld: false })
  webhookUrl: string;
}
