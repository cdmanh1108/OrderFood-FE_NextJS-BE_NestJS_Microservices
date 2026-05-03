import { Module } from '@nestjs/common';
import { MessagingClientsModule } from '@app/messaging/messaging-clients.module';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';

@Module({
  imports: [
    MessagingClientsModule.register([
      {
        name: RMQ_SERVICES.DINEIN,
        queue: RMQ_QUEUES.DINEIN,
      },
      {
        name: RMQ_SERVICES.ORDERING,
        queue: RMQ_QUEUES.ORDERING,
      },
    ]),
  ],
  exports: [MessagingClientsModule],
})
export class DineinRmqClientModule {}
