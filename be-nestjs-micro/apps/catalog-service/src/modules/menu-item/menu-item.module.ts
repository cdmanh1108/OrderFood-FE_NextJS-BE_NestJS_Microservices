import { Module } from '@nestjs/common';
import { MenuItemService } from './menu-item.service';
import { MenuItemController } from './menu-item.controller';
import { CatalogCacheModule } from '../cache/catalog-cache.module';

@Module({
  imports: [CatalogCacheModule],
  providers: [MenuItemService],
  controllers: [MenuItemController],
})
export class MenuItemModule {}
