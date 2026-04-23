import { Module } from '@nestjs/common';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { GmailMailProvider } from './providers/gmail-mail.provider';

@Module({
  controllers: [EmailController],
  providers: [EmailService, GmailMailProvider],
})
export class EmailModule {}
