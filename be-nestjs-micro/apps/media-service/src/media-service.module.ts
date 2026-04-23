import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/logger';
import { MediaController } from './media-service.controller';
import { MediaService } from './media-service.service';
import { MediaUrlBuilder } from './providers/media-url.builder';
import { S3Provider } from './providers/s3.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.media-service',
    }),
    LoggerModule,
  ],
  controllers: [MediaController],
  providers: [MediaService, MediaUrlBuilder, S3Provider],
})
export class MediaModule {}
