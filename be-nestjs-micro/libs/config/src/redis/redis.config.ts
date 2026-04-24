import { ConfigService } from '@nestjs/config';

const DEFAULT_VERIFY_CODE_TTL = 300;

export interface RedisConfig {
  redisUrl: string;
  ttlVerifyCode: number;
}

export function getRedisConfig(configService: ConfigService): RedisConfig {
  const redisUrl =
    configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379/0';

  const ttlRaw =
    configService.get<string>('REDIS_TTL_VERIFY_CODE') ??
    `${DEFAULT_VERIFY_CODE_TTL}`;

  const parsedTtl = Number(ttlRaw);

  return {
    redisUrl,
    ttlVerifyCode:
      Number.isFinite(parsedTtl) && parsedTtl > 0
        ? parsedTtl
        : DEFAULT_VERIFY_CODE_TTL,
  };
}
