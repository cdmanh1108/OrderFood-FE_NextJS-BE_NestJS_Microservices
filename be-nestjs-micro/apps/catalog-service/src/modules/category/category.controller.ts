import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { CATALOG_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/common/rmq/rpc-message.helper';
import { CategoryService } from './category.service';
import type { CreateCategoryCommand } from '@app/contracts/catalog/category/commands/create-category.command';
import type { UpdateCategoryCommand } from '@app/contracts/catalog/category/commands/update-category.command';
import type { GetCategoryDetailQuery } from '@app/contracts/catalog/category/commands/get-category-detail.query';
import type { ListCategoriesQuery } from '@app/contracts/catalog/category/commands/list-categories.query';
import type { SetCategoryActiveCommand } from '@app/contracts/catalog/category/commands/set-category-active.command';
import type { DeleteCategoryCommand } from '@app/contracts/catalog/category/commands/delete-category.command';

@Controller()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern(CATALOG_PATTERNS.CREATE_CATEGORY)
  create(
    @Payload() command: CreateCategoryCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.categoryService.create(command));
  }

  @MessagePattern(CATALOG_PATTERNS.UPDATE_CATEGORY)
  update(
    @Payload() command: UpdateCategoryCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.categoryService.update(command.id, command),
    );
  }

  @MessagePattern(CATALOG_PATTERNS.GET_CATEGORY_DETAIL)
  findOne(
    @Payload() query: GetCategoryDetailQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.categoryService.findOne(query.id));
  }

  @MessagePattern(CATALOG_PATTERNS.LIST_CATEGORIES)
  findAll(@Payload() query: ListCategoriesQuery, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.categoryService.findAll(query));
  }

  @MessagePattern(CATALOG_PATTERNS.SET_CATEGORY_ACTIVE)
  setActive(
    @Payload() command: SetCategoryActiveCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.categoryService.setActive(command.id, command.isActive),
    );
  }

  @MessagePattern(CATALOG_PATTERNS.DELETE_CATEGORY)
  remove(
    @Payload() command: DeleteCategoryCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.categoryService.remove(command.id));
  }
}
