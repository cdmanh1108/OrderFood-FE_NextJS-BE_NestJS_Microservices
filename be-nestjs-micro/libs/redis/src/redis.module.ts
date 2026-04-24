import Redis from 'ioredis';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from './redis.constants';
import { getRedisConfig } from '@app/config/redis/redis.config';
import { RedisService } from './redis.service';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = getRedisConfig(configService);

        return new Redis(config.redisUrl);
      },
    },
    RedisService,
  ],
  exports: [REDIS_CLIENT, RedisService],
})
export class RedisModule {}
