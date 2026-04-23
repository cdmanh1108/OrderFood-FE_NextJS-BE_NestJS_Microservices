import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@app/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from '@app/common/filters/global-exception.filter';
import { AppLoggerService } from '@app/logger/logger.service';
import { HttpLoggingInterceptor } from '@app/logger/interceptors/http-logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const logger = app.get(AppLoggerService);

  app.useGlobalInterceptors(
    new HttpLoggingInterceptor(logger),
    new ResponseInterceptor(),
  );

  app.enableCors({
    origin: true,
    Credentials: true,
  });

  app.useGlobalFilters(new GlobalExceptionFilter());

  await app.listen(process.env.port ?? 3000);
  console.log(
    `Gateway is running on http://localhost:${process.env.port ?? 3000}/api/v1`,
  );
}
void bootstrap();
