import { Module } from '@nestjs/common';
import { RedisModule } from 'libs/redis';
import { CatalogCacheService } from './catalog-cache.service';

@Module({
  imports: [RedisModule],
  providers: [CatalogCacheService],
  exports: [CatalogCacheService],
})
export class CatalogCacheModule {}
