import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';

import { CATALOG_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/common/rmq/rpc-message.helper';

import type { CreateMenuItemCommand } from '@app/contracts/catalog/menu-item/commands/create-menu-item.command';
import type { UpdateMenuItemCommand } from '@app/contracts/catalog/menu-item/commands/update-menu-item.command';
import type { GetMenuItemsQuery } from '@app/contracts/catalog/menu-item/commands/get-menu-items.query';
import type { GetMenuItemDetailQuery } from '@app/contracts/catalog/menu-item/commands/get-menu-item-detail.query';
import type { GetFeaturedMenuItemsQuery } from '@app/contracts/catalog/menu-item/commands/get-featured-menu-items.query';
import type { ListMenuItemsQuery } from '@app/contracts/catalog/menu-item/commands/list-menu-items.query';
import type { SetMenuItemActiveCommand } from '@app/contracts/catalog/menu-item/commands/set-menu-item-active.command';
import type { DeleteMenuItemCommand } from '@app/contracts/catalog/menu-item/commands/delete-menu-item.command';
import { MenuItemService } from './menu-item.service';

@Controller()
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @MessagePattern(CATALOG_PATTERNS.CREATE_MENU_ITEM)
  create(
    @Payload() command: CreateMenuItemCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.menuItemService.create(command),
    );
  }

  @MessagePattern(CATALOG_PATTERNS.UPDATE_MENU_ITEM)
  update(
    @Payload() command: UpdateMenuItemCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.menuItemService.update(command.id, command),
    );
  }

  @MessagePattern(CATALOG_PATTERNS.GET_MENU_ITEM_DETAIL)
  findOne(
    @Payload() query: GetMenuItemDetailQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.menuItemService.findOne(query.id),
    );
  }

  @MessagePattern(CATALOG_PATTERNS.LIST_MENU_ITEMS)
  findAll(@Payload() query: ListMenuItemsQuery, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.menuItemService.findAll(query));
  }

  @MessagePattern(CATALOG_PATTERNS.GET_MENU_ITEMS)
  findMenu(@Payload() query: GetMenuItemsQuery, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () =>
      this.menuItemService.findMenu(query),
    );
  }

  @MessagePattern(CATALOG_PATTERNS.GET_FEATURED_MENU_ITEMS)
  findFeatured(
    @Payload() query: GetFeaturedMenuItemsQuery | undefined,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.menuItemService.findFeatured(query?.limit),
    );
  }

  @MessagePattern(CATALOG_PATTERNS.SET_MENU_ITEM_ACTIVE)
  setActive(
    @Payload() command: SetMenuItemActiveCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.menuItemService.setActive(command.id, command.isActive),
    );
  }

  @MessagePattern(CATALOG_PATTERNS.DELETE_MENU_ITEM)
  remove(
    @Payload() command: DeleteMenuItemCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.menuItemService.remove(command.id),
    );
  }
}
