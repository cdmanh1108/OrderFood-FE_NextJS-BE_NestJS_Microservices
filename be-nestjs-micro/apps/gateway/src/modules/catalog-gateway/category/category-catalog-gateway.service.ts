import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { CATALOG_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { CreateCategoryRequestDto } from './dto/request/create-category.request.dto';
import { UpdateCategoryRequestDto } from './dto/request/update-category.request.dto';
import { ListCategoriesRequestDto } from './dto/request/list-categories.request.dto';
import { SetCategoryActiveRequestDto } from './dto/request/set-category-active.request.dto';
import { CreateCategoryCommand } from '@app/contracts/catalog/category/commands/create-category.command';
import { UpdateCategoryCommand } from '@app/contracts/catalog/category/commands/update-category.command';
import { GetCategoryDetailQuery } from '@app/contracts/catalog/category/commands/get-category-detail.query';
import { ListCategoriesQuery } from '@app/contracts/catalog/category/commands/list-categories.query';
import { SetCategoryActiveCommand } from '@app/contracts/catalog/category/commands/set-category-active.command';
import { DeleteCategoryCommand } from '@app/contracts/catalog/category/commands/delete-category.command';
import { CategoryDetailResult } from '@app/contracts/catalog/category/results/category-detail.result';
import { PaginatedCategoriesResult } from '@app/contracts/catalog/category/results/paginated-categories.result';
import { DeleteCategoryResult } from '@app/contracts/catalog/category/results/delete-category.result';

@Injectable()
export class CategoryCatalogGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.CATALOG)
    private readonly catalogClient: ClientProxy,
  ) {}

  async create(dto: CreateCategoryRequestDto): Promise<CategoryDetailResult> {
    const command: CreateCategoryCommand = {
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      image: dto.image,
      sortOrder: dto.sortOrder,
      isActive: dto.isActive,
    };

    return firstValueFrom(
      this.catalogClient
        .send<CategoryDetailResult, CreateCategoryCommand>(
          CATALOG_PATTERNS.CREATE_CATEGORY,
          command,
        )
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async update(
    id: string,
    dto: UpdateCategoryRequestDto,
  ): Promise<CategoryDetailResult> {
    const command: UpdateCategoryCommand = {
      id,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      image: dto.image,
      sortOrder: dto.sortOrder,
    };

    return firstValueFrom(
      this.catalogClient
        .send<CategoryDetailResult, UpdateCategoryCommand>(
          CATALOG_PATTERNS.UPDATE_CATEGORY,
          command,
        )
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async findOne(id: string): Promise<CategoryDetailResult> {
    const query: GetCategoryDetailQuery = { id };

    return firstValueFrom(
      this.catalogClient
        .send<CategoryDetailResult, GetCategoryDetailQuery>(
          CATALOG_PATTERNS.GET_CATEGORY_DETAIL,
          query,
        )
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async findAll(dto: ListCategoriesRequestDto): Promise<PaginatedCategoriesResult> {
    const query: ListCategoriesQuery = {
      keyword: dto.keyword,
      isActive: dto.isActive,
      page: dto.page,
      limit: dto.limit,
      sortBy: dto.sortBy,
      sortOrder: dto.sortOrder,
    };

    return firstValueFrom(
      this.catalogClient
        .send<PaginatedCategoriesResult, ListCategoriesQuery>(
          CATALOG_PATTERNS.LIST_CATEGORIES,
          query,
        )
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async setActive(
    id: string,
    dto: SetCategoryActiveRequestDto,
  ): Promise<CategoryDetailResult> {
    const command: SetCategoryActiveCommand = {
      id,
      isActive: dto.isActive,
    };

    return firstValueFrom(
      this.catalogClient
        .send<CategoryDetailResult, SetCategoryActiveCommand>(
          CATALOG_PATTERNS.SET_CATEGORY_ACTIVE,
          command,
        )
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async remove(id: string): Promise<DeleteCategoryResult> {
    const command: DeleteCategoryCommand = { id };

    return firstValueFrom(
      this.catalogClient
        .send<DeleteCategoryResult, DeleteCategoryCommand>(
          CATALOG_PATTERNS.DELETE_CATEGORY,
          command,
        )
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }
}
