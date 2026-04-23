import { NestFactory } from '@nestjs/core';
import { IamServiceModule } from './iam-service.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { createRmqServerOptions } from '@app/messaging/config/rmq.config';
import { RMQ_QUEUES } from '@app/messaging/constants/queues.constant';
import { GlobalRpcExceptionFilter } from '@app/common/filters/global-rpc-exception.filter';
import { AppLoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    IamServiceModule,
    createRmqServerOptions(RMQ_QUEUES.IAM),
  );
  const logger = app.get(AppLoggerService);

  app.useGlobalFilters(new GlobalRpcExceptionFilter());

  await app.listen();

  logger.logWithContext('Iam Service started', 'Bootstrap', {
    queue: 'iam_queue',
  });
}
void bootstrap();
