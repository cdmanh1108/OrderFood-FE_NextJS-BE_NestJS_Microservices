import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import {
  RMQ_DEFAULT_RETRY_DELAY_MS,
  createRmqServerOptions,
} from '@app/messaging/config/rmq.config';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { GlobalRpcExceptionFilter } from '@app/common/filters/global-rpc-exception.filter';
import { AppLoggerService } from '@app/logger';
import { NotificationServiceModule } from './notification-service.module';

function getNotificationRetryDelayMs(): number {
  const raw = Number(process.env.RMQ_NOTIFICATION_RETRY_DELAY_MS);
  if (Number.isInteger(raw) && raw > 0) {
    return raw;
  }

  return RMQ_DEFAULT_RETRY_DELAY_MS;
}

function shouldBindMainQueueToRetryDlx(): boolean {
  return process.env.RMQ_NOTIFICATION_BIND_MAIN_DLX === 'true';
}

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    createRmqServerOptions(RMQ_QUEUES.NOTIFICATION, {
      retryTopology: {
        enabled: true,
        retryDelayMs: getNotificationRetryDelayMs(),
        bindMainQueueToRetryDlx: shouldBindMainQueueToRetryDlx(),
      },
    }),
  );
  const logger = app.get(AppLoggerService);

  app.useGlobalFilters(new GlobalRpcExceptionFilter());

  await app.listen();

  logger.logWithContext('Notification Service started', 'Bootstrap', {
    queue: 'notification_queue',
  });
}
void bootstrap();
