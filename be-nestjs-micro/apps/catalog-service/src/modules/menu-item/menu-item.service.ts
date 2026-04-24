import { Injectable } from '@nestjs/common';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { CatalogPrismaService } from '@app/database/catalog-prisma.service';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { CreateMenuItemCommand } from '@app/contracts/catalog/menu-item/commands/create-menu-item.command';
import { UpdateMenuItemCommand } from '@app/contracts/catalog/menu-item/commands/update-menu-item.command';
import { GetMenuItemsQuery } from '@app/contracts/catalog/menu-item/commands/get-menu-items.query';
import { ListMenuItemsQuery } from '@app/contracts/catalog/menu-item/commands/list-menu-items.query';
import { MenuItemDetailResult } from '@app/contracts/catalog/menu-item/results/menu-item-detail.result';
import { MenuItemSimpleResult } from '@app/contracts/catalog/menu-item/results/menu-item-simple.result';
import { PaginatedMenuItemsResult } from '@app/contracts/catalog/menu-item/results/paginated-menu-items.result';
import { DeleteMenuItemResult } from '@app/contracts/catalog/menu-item/results/delete-menu-item.result';
import { ConfigService } from '@nestjs/config';
import { CatalogCacheService } from '../cache/catalog-cache.service';

@Injectable()
export class MenuItemService {
  private readonly mediaPublicBaseUrl: string;

  constructor(
    private readonly prisma: CatalogPrismaService,
    private readonly configService: ConfigService,
    private readonly catalogCacheService: CatalogCacheService,
  ) {
    this.mediaPublicBaseUrl = (
      this.configService.get<string>('AWS_S3_PUBLIC_BASE_URL') ?? ''
    )
      .trim()
      .replace(/\/+$/g, '');
  }

  async create(command: CreateMenuItemCommand): Promise<MenuItemDetailResult> {
    await this.ensureCategoryExists(command.categoryId);
    await this.ensureSlugUnique(command.slug);

    if (command.sku) {
      await this.ensureSkuUnique(command.sku);
    }

    const created = await this.prisma.menuItem.create({
      data: {
        categoryId: command.categoryId,
        name: command.name,
        slug: command.slug,
        description: command.description ?? null,
        image: this.normalizeImageInput(command.image),
        sku: command.sku ?? null,
        price: command.price,
        isActive: command.isActive ?? true,
        isAvailable: command.isAvailable ?? true,
        sortOrder: command.sortOrder ?? 0,
      },
    });

    await this.clearMenuRelatedCache();

    return this.toMenuItemDetailResult(created);
  }

  async update(
    id: string,
    command: Omit<UpdateMenuItemCommand, 'id'>,
  ): Promise<MenuItemDetailResult> {
    const current = await this.prisma.menuItem.findUnique({ where: { id } });

    if (!current) {
      throw new AppRpcException({
        code: ERRORS.MENU_ITEM_NOT_FOUND.code,
        message: ERRORS.MENU_ITEM_NOT_FOUND.message,
      });
    }

    if (command.categoryId && command.categoryId !== current.categoryId) {
      await this.ensureCategoryExists(command.categoryId);
    }

    if (command.slug && command.slug !== current.slug) {
      await this.ensureSlugUnique(command.slug, id);
    }

    if (
      command.sku !== undefined &&
      command.sku !== current.sku &&
      command.sku
    ) {
      await this.ensureSkuUnique(command.sku, id);
    }

    const data: {
      name?: string;
      slug?: string;
      description?: string;
      image?: string | null;
      sku?: string;
      price?: number;
      isAvailable?: boolean;
      sortOrder?: number;
      categoryId?: string;
    } = {};

    if (command.name !== undefined) data.name = command.name;
    if (command.slug !== undefined) data.slug = command.slug;
    if (command.description !== undefined)
      data.description = command.description;
    if (command.image !== undefined)
      data.image = this.normalizeImageInput(command.image);
    if (command.sku !== undefined) data.sku = command.sku;
    if (command.price !== undefined) data.price = command.price;
    if (command.isAvailable !== undefined)
      data.isAvailable = command.isAvailable;
    if (command.sortOrder !== undefined) data.sortOrder = command.sortOrder;
    if (command.categoryId !== undefined) data.categoryId = command.categoryId;

    if (Object.keys(data).length === 0) {
      return this.toMenuItemDetailResult(current);
    }

    const updated = await this.prisma.menuItem.update({
      where: { id },
      data,
    });

    await this.clearMenuRelatedCache();

    return this.toMenuItemDetailResult(updated);
  }

  async findOne(id: string): Promise<MenuItemDetailResult> {
    const menuItem = await this.prisma.menuItem.findUnique({ where: { id } });

    if (!menuItem) {
      throw new AppRpcException({
        code: ERRORS.MENU_ITEM_NOT_FOUND.code,
        message: ERRORS.MENU_ITEM_NOT_FOUND.message,
      });
    }

    return this.toMenuItemDetailResult(menuItem);
  }

  async findAll(query: ListMenuItemsQuery): Promise<PaginatedMenuItemsResult> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 100) : 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(query.keyword
        ? {
            OR: [
              {
                name: {
                  contains: query.keyword,
                  mode: 'insensitive' as const,
                },
              },
              {
                slug: {
                  contains: query.keyword,
                  mode: 'insensitive' as const,
                },
              },
              {
                sku: {
                  contains: query.keyword,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(typeof query.isActive === 'boolean'
        ? { isActive: query.isActive }
        : {}),
      ...(typeof query.isAvailable === 'boolean'
        ? { isAvailable: query.isAvailable }
        : {}),
    };

    const sortBy = query.sortBy ?? 'sortOrder';
    const sortOrder = query.sortOrder ?? 'asc';
    const orderBy = {
      [sortBy]: sortOrder,
    } as Record<string, 'asc' | 'desc'>;

    const [items, total] = await Promise.all([
      this.prisma.menuItem.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.menuItem.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toMenuItemDetailResult(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMenu(query: GetMenuItemsQuery): Promise<MenuItemSimpleResult[]> {
    const cached = await this.catalogCacheService.getMenu(query);
    if (cached !== null) {
      return cached;
    }

    const limit =
      query.limit && query.limit > 0 ? Math.min(query.limit, 200) : 100;

    const items = await this.prisma.menuItem.findMany({
      where: {
        isActive: true,
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.keyword
          ? {
              OR: [
                {
                  name: {
                    contains: query.keyword,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  slug: {
                    contains: query.keyword,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: {
        sortOrder: 'asc',
      },
      take: limit,
    });

    const result = items.map((item) => this.toMenuItemSimpleResult(item));

    await this.catalogCacheService.setMenu(query, result);

    return result;
  }

  async findFeatured(limit = 3): Promise<MenuItemSimpleResult[]> {
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 10) : 3;

    const items = await this.prisma.menuItem.findMany({
      where: {
        isActive: true,
        isAvailable: true,
        sortOrder: {
          in: [0, 1, 2],
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
      take: safeLimit,
    });

    return items.map((item) => this.toMenuItemSimpleResult(item));
  }

  async setActive(
    id: string,
    isActive: boolean,
  ): Promise<MenuItemDetailResult> {
    const current = await this.prisma.menuItem.findUnique({ where: { id } });

    if (!current) {
      throw new AppRpcException({
        code: ERRORS.MENU_ITEM_NOT_FOUND.code,
        message: ERRORS.MENU_ITEM_NOT_FOUND.message,
      });
    }

    const updated = await this.prisma.menuItem.update({
      where: { id },
      data: { isActive },
    });

    await this.clearMenuRelatedCache();

    return this.toMenuItemDetailResult(updated);
  }

  async remove(id: string): Promise<DeleteMenuItemResult> {
    const current = await this.prisma.menuItem.findUnique({ where: { id } });

    if (!current) {
      throw new AppRpcException({
        code: ERRORS.MENU_ITEM_NOT_FOUND.code,
        message: ERRORS.MENU_ITEM_NOT_FOUND.message,
      });
    }

    await this.prisma.menuItem.delete({ where: { id } });
    await this.clearMenuRelatedCache();

    return {
      id,
      deleted: true,
    };
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppRpcException({
        code: ERRORS.MENU_ITEM_CATEGORY_NOT_FOUND.code,
        message: ERRORS.MENU_ITEM_CATEGORY_NOT_FOUND.message,
      });
    }
  }

  private async ensureSlugUnique(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existedBySlug = await this.prisma.menuItem.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (existedBySlug) {
      throw new AppRpcException({
        code: ERRORS.MENU_ITEM_SLUG_ALREADY_EXISTS.code,
        message: ERRORS.MENU_ITEM_SLUG_ALREADY_EXISTS.message,
      });
    }
  }

  private async ensureSkuUnique(
    sku: string,
    excludeId?: string,
  ): Promise<void> {
    const existedBySku = await this.prisma.menuItem.findFirst({
      where: {
        sku,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });

    if (existedBySku) {
      throw new AppRpcException({
        code: ERRORS.MENU_ITEM_SKU_ALREADY_EXISTS.code,
        message: ERRORS.MENU_ITEM_SKU_ALREADY_EXISTS.message,
      });
    }
  }

  private toMenuItemDetailResult(menuItem: {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    sku: string | null;
    price: { toNumber(): number };
    isActive: boolean;
    isAvailable: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }): MenuItemDetailResult {
    return {
      id: menuItem.id,
      categoryId: menuItem.categoryId,
      name: menuItem.name,
      slug: menuItem.slug,
      description: menuItem.description,
      image: this.resolveImageUrl(menuItem.image),
      sku: menuItem.sku,
      price: menuItem.price.toNumber(),
      isActive: menuItem.isActive,
      isAvailable: menuItem.isAvailable,
      sortOrder: menuItem.sortOrder,
      createdAt: menuItem.createdAt,
      updatedAt: menuItem.updatedAt,
    };
  }

  private toMenuItemSimpleResult(menuItem: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    price: { toNumber(): number };
  }): MenuItemSimpleResult {
    return {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      image: this.resolveImageUrl(menuItem.image),
      price: menuItem.price.toNumber(),
    };
  }

  private async clearMenuRelatedCache(): Promise<void> {
    await Promise.all([
      this.catalogCacheService.clearMenuCache(),
      this.catalogCacheService.clearMenuCategoriesCache(),
    ]);
  }

  private normalizeImageInput(image?: string): string | null {
    const value = image?.trim();

    if (!value) {
      return null;
    }

    const keyFromPublicUrl = this.extractKeyFromPublicUrl(value);
    if (keyFromPublicUrl) {
      return keyFromPublicUrl;
    }

    return value.replace(/^\/+/, '');
  }

  private extractKeyFromPublicUrl(url: string): string | null {
    if (!this.mediaPublicBaseUrl) {
      return null;
    }

    if (!url.startsWith(`${this.mediaPublicBaseUrl}/`)) {
      return null;
    }

    const key = url
      .slice(this.mediaPublicBaseUrl.length + 1)
      .replace(/^\/+/, '');
    return key || null;
  }

  private resolveImageUrl(image: string | null): string | null {
    if (!image) {
      return null;
    }

    const value = image.trim();
    if (!value) {
      return null;
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    if (!this.mediaPublicBaseUrl) {
      return value;
    }

    return `${this.mediaPublicBaseUrl}/${value.replace(/^\/+/, '')}`;
  }
}
