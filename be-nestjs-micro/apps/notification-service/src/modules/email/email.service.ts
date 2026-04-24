import { Injectable } from '@nestjs/common';
import { SendVerifyEmailEvent } from '@app/contracts/notification/email/events/send-verify-email.event';
import { GmailMailProvider } from './providers/gmail.provider';
import { buildVerifyEmailHtml } from './templates/verify-email.template';

@Injectable()
export class EmailService {
  constructor(private readonly gmailMailProvider: GmailMailProvider) {}

  async sendVerifyEmail(event: SendVerifyEmailEvent): Promise<void> {
    const html = buildVerifyEmailHtml({
      fullName: event.fullName,
      code: event.code,
    });

    await this.gmailMailProvider.sendMail({
      to: event.email,
      subject: 'Mã xác thực đăng ký tài khoản Bún Đậu Làng Mơ',
      html,
    });
  }
}
