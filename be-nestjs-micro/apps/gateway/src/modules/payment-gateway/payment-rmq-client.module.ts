import { Module } from '@nestjs/common';
import { MessagingClientsModule } from '@app/messaging/messaging-clients.module';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';

@Module({
  imports: [
    MessagingClientsModule.register([
      {
        name: RMQ_SERVICES.PAYMENT,
        queue: RMQ_QUEUES.PAYMENT,
      },
    ]),
  ],
  exports: [MessagingClientsModule],
})
export class PaymentRmqClientModule {}
