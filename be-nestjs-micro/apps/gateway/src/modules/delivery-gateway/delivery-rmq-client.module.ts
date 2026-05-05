import { Module } from '@nestjs/common';
import { MessagingClientsModule } from '@app/messaging/messaging-clients.module';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';

@Module({
  imports: [
    MessagingClientsModule.register([
      {
        name: RMQ_SERVICES.DELIVERY,
        queue: RMQ_QUEUES.DELIVERY,
      },
      {
        name: RMQ_SERVICES.IAM,
        queue: RMQ_QUEUES.IAM,
      },
      {
        name: RMQ_SERVICES.MEDIA,
        queue: RMQ_QUEUES.MEDIA,
      },
    ]),
  ],
  exports: [MessagingClientsModule],
})
export class DeliveryRmqClientModule {}
