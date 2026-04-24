import { ConfigService } from '@nestjs/config';

export interface RedisConfig {
  redisUrl: string;
  ttlVerifyCode: number;
  ttlMenu: number;
}

export function getRedisConfig(configService: ConfigService): RedisConfig {
  const redisUrl =
    configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379/0';

  const ttlRaw = configService.get<string>('REDIS_TTL_VERIFY_CODE');
  const menuTtl = configService.get<string>('REDIS_TTL_MENU_CACHE');

  const parsedTtl = Number(ttlRaw);
  const parsedmenuTtl = Number(menuTtl);

  return {
    redisUrl,
    ttlVerifyCode: parsedTtl,
    ttlMenu: parsedmenuTtl,
  };
}
