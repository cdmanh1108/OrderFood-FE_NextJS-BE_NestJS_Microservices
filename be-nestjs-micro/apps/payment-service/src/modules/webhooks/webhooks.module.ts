import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

import { PaymentProvidersModule } from '../../providers/providers.module';
import { MessagingClientsModule } from '@app/messaging/messaging-clients.module';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';

@Module({
  imports: [
    PaymentProvidersModule, 
    MessagingClientsModule.register([
      { name: RMQ_SERVICES.ORDERING, queue: RMQ_QUEUES.ORDERING },
    ])
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
