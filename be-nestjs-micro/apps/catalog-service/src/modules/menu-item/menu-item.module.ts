import { Module } from '@nestjs/common';
import { MenuItemService } from './menu-item.service';
import { MenuItemController } from './menu-item.controller';

@Module({
  providers: [MenuItemService],
  controllers: [MenuItemController],
})
export class MenuItemModule {}
