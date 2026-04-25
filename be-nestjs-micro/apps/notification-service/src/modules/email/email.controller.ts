import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RMQ_DEFAULT_MAX_RETRY_COUNT } from '@app/messaging/config/rmq.config';
import { handleEventMessage } from '@app/messaging/rmq/rpc-message.helper';
import { EmailService } from './email.service';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { NOTIFICATION_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { type SendVerifyEmailEvent } from '@app/contracts/notification/email/events/send-verify-email.event';

function getMaxRetryCount(): number {
  const raw = Number(process.env.NOTIFICATION_EMAIL_MAX_RETRY_COUNT);
  if (Number.isInteger(raw) && raw >= 0) {
    return raw;
  }

  return RMQ_DEFAULT_MAX_RETRY_COUNT;
}

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @EventPattern(NOTIFICATION_PATTERNS.SEND_VERIFY_EMAIL)
  handleSendVerifyEmail(
    @Payload() event: SendVerifyEmailEvent,
    @Ctx() context: RmqContext,
  ) {
    return handleEventMessage(
      context,
      () => this.emailService.sendVerifyEmail(event),
      {
        queue: RMQ_QUEUES.NOTIFICATION,
        maxRetryCount: getMaxRetryCount(),
        onDuplicate: 'ack',
        onExpired: 'ack',
      },
    );
  }
}
