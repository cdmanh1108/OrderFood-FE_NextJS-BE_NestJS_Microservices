import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

import { PaymentProvidersModule } from '../../providers/providers.module';
import { MessagingClientsModule } from '@app/messaging/messaging-clients.module';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';

@Module({
  imports: [
    PaymentProvidersModule,
    MessagingClientsModule.register([
      { name: RMQ_SERVICES.ORDERING, queue: RMQ_QUEUES.ORDERING },
    ]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
