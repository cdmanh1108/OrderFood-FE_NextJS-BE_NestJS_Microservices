import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { NOTIFICATION_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { SendVerifyEmailEvent } from '@app/contracts/notification/email/events/send-verify-email.event';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern(NOTIFICATION_PATTERNS.SEND_VERIFY_EMAIL)
  async handleSendVerifyEmail(@Payload() event: SendVerifyEmailEvent) {
    await this.emailService.sendVerifyEmail(event);
  }
}
