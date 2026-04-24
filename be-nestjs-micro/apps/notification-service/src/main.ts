import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createRmqServerOptions } from '@app/messaging/config/rmq.config';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { GlobalRpcExceptionFilter } from '@app/common/filters/global-rpc-exception.filter';
import { AppLoggerService } from '@app/logger';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    createRmqServerOptions(RMQ_QUEUES.NOTIFICATION),
  );
  const logger = app.get(AppLoggerService);

  app.useGlobalFilters(new GlobalRpcExceptionFilter());

  await app.listen();

  logger.logWithContext('Notification Service started', 'Bootstrap', {
    queue: 'notification_queue',
  });
}
void bootstrap();
