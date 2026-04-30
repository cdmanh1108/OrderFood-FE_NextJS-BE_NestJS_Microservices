import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { GlobalRpcExceptionFilter } from '@app/common/filters/global-rpc-exception.filter';
import { createRmqServerOptions } from '@app/messaging/config/rmq.config';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { AppLoggerService } from '@app/logger';
import { PaymentServiceModule } from './payment-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentServiceModule,
    createRmqServerOptions(RMQ_QUEUES.PAYMENT),
  );
  const logger = app.get(AppLoggerService);

  app.useGlobalFilters(new GlobalRpcExceptionFilter());

  await app.listen();

  logger.logWithContext('Payment service started', 'Bootstrap', {
    queue: 'payment_queue',
  });
}
void bootstrap();
