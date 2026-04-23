import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { CATALOG_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { CreateMenuItemRequestDto } from './dto/request/create-menu-item.request.dto';
import { GetMenuItemsRequestDto } from './dto/request/get-menu-items.request.dto';
import { UpdateMenuItemRequestDto } from './dto/request/update-menu-item.request.dto';
import { ListMenuItemsRequestDto } from './dto/request/list-menu-items.request.dto';
import { SetMenuItemActiveRequestDto } from './dto/request/set-menu-item-active.request.dto';
import { CreateMenuItemCommand } from '@app/contracts/catalog/menu-item/commands/create-menu-item.command';
import { UpdateMenuItemCommand } from '@app/contracts/catalog/menu-item/commands/update-menu-item.command';
import { GetMenuItemsQuery } from '@app/contracts/catalog/menu-item/commands/get-menu-items.query';
import { GetMenuItemDetailQuery } from '@app/contracts/catalog/menu-item/commands/get-menu-item-detail.query';
import { ListMenuItemsQuery } from '@app/contracts/catalog/menu-item/commands/list-menu-items.query';
import { GetFeaturedMenuItemsQuery } from '@app/contracts/catalog/menu-item/commands/get-featured-menu-items.query';
import { SetMenuItemActiveCommand } from '@app/contracts/catalog/menu-item/commands/set-menu-item-active.command';
import { DeleteMenuItemCommand } from '@app/contracts/catalog/menu-item/commands/delete-menu-item.command';
import { MenuItemDetailResult } from '@app/contracts/catalog/menu-item/results/menu-item-detail.result';
import { MenuItemSimpleResult } from '@app/contracts/catalog/menu-item/results/menu-item-simple.result';
import { PaginatedMenuItemsResult } from '@app/contracts/catalog/menu-item/results/paginated-menu-items.result';
import { DeleteMenuItemResult } from '@app/contracts/catalog/menu-item/results/delete-menu-item.result';

@Injectable()
export class MenuItemCatalogGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.CATALOG)
    private readonly catalogClient: ClientProxy,
  ) {}

  async create(dto: CreateMenuItemRequestDto): Promise<MenuItemDetailResult> {
    const command: CreateMenuItemCommand = {
      categoryId: dto.categoryId,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      image: dto.image,
      price: dto.price,
      isAvailable: dto.isAvailable,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
      sku: dto.sku,
    };

    return firstValueFrom(
      this.catalogClient
        .send<
          MenuItemDetailResult,
          CreateMenuItemCommand
        >(CATALOG_PATTERNS.CREATE_MENU_ITEM, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async update(
    id: string,
    dto: UpdateMenuItemRequestDto,
  ): Promise<MenuItemDetailResult> {
    const command: UpdateMenuItemCommand = {
      id,
      categoryId: dto.categoryId,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      image: dto.image,
      price: dto.price,
      sortOrder: dto.sortOrder,
      sku: dto.sku,
      isAvailable: dto.isAvailable,
    };

    return firstValueFrom(
      this.catalogClient
        .send<
          MenuItemDetailResult,
          UpdateMenuItemCommand
        >(CATALOG_PATTERNS.UPDATE_MENU_ITEM, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async findOne(id: string): Promise<MenuItemDetailResult> {
    const query: GetMenuItemDetailQuery = { id };

    return firstValueFrom(
      this.catalogClient
        .send<
          MenuItemDetailResult,
          GetMenuItemDetailQuery
        >(CATALOG_PATTERNS.GET_MENU_ITEM_DETAIL, query)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async findAll(
    dto: ListMenuItemsRequestDto,
  ): Promise<PaginatedMenuItemsResult> {
    const query: ListMenuItemsQuery = {
      keyword: dto.keyword,
      categoryId: dto.categoryId,
      isActive: dto.isActive,
      isAvailable: dto.isAvailable,
      page: dto.page,
      limit: dto.limit,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
    };

    return firstValueFrom(
      this.catalogClient
        .send<
          PaginatedMenuItemsResult,
          ListMenuItemsQuery
        >(CATALOG_PATTERNS.LIST_MENU_ITEMS, query)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async findMenu(dto: GetMenuItemsRequestDto): Promise<MenuItemSimpleResult[]> {
    const query: GetMenuItemsQuery = {
      keyword: dto.keyword,
      categoryId: dto.categoryId,
      limit: dto.limit,
    };

    return firstValueFrom(
      this.catalogClient
        .send<
          MenuItemSimpleResult[],
          GetMenuItemsQuery
        >(CATALOG_PATTERNS.GET_MENU_ITEMS, query)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async findFeatured(): Promise<MenuItemSimpleResult[]> {
    const query: GetFeaturedMenuItemsQuery = { limit: 3 };

    return firstValueFrom(
      this.catalogClient
        .send<
          MenuItemSimpleResult[],
          GetFeaturedMenuItemsQuery
        >(CATALOG_PATTERNS.GET_FEATURED_MENU_ITEMS, query)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async setActive(
    id: string,
    dto: SetMenuItemActiveRequestDto,
  ): Promise<MenuItemDetailResult> {
    const command: SetMenuItemActiveCommand = {
      id,
      isActive: dto.isActive,
    };

    return firstValueFrom(
      this.catalogClient
        .send<
          MenuItemDetailResult,
          SetMenuItemActiveCommand
        >(CATALOG_PATTERNS.SET_MENU_ITEM_ACTIVE, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async remove(id: string): Promise<DeleteMenuItemResult> {
    const command: DeleteMenuItemCommand = { id };

    return firstValueFrom(
      this.catalogClient
        .send<
          DeleteMenuItemResult,
          DeleteMenuItemCommand
        >(CATALOG_PATTERNS.DELETE_MENU_ITEM, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }
}
