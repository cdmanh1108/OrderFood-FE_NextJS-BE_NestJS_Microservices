import { Injectable } from '@nestjs/common';
import { CatalogPrismaService } from '@app/database/catalog-prisma.service';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { CreateCategoryCommand } from '@app/contracts/catalog/category/commands/create-category.command';
import { UpdateCategoryCommand } from '@app/contracts/catalog/category/commands/update-category.command';
import { ListCategoriesQuery } from '@app/contracts/catalog/category/commands/list-categories.query';
import { CategoryDetailResult } from '@app/contracts/catalog/category/results/category-detail.result';
import { PaginatedCategoriesResult } from '@app/contracts/catalog/category/results/paginated-categories.result';
import { DeleteCategoryResult } from '@app/contracts/catalog/category/results/delete-category.result';
import { MenuCategorySimpleResult } from '@app/contracts/catalog/menu-item/results/menu-category-simple.result';
import { CatalogCacheService } from '../cache/catalog-cache.service';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prisma: CatalogPrismaService,
    private readonly catalogCacheService: CatalogCacheService,
  ) {}

  async create(command: CreateCategoryCommand): Promise<CategoryDetailResult> {
    const existedBySlug = await this.prisma.category.findUnique({
      where: { slug: command.slug },
    });

    if (existedBySlug) {
      throw new AppRpcException({
        code: ERRORS.CATEGORY_SLUG_ALREADY_EXISTS.code,
        message: ERRORS.CATEGORY_SLUG_ALREADY_EXISTS.message,
      });
    }

    const existedByName = await this.prisma.category.findFirst({
      where: { name: command.name },
    });

    if (existedByName) {
      throw new AppRpcException({
        code: ERRORS.CATEGORY_NAME_ALREADY_EXISTS.code,
        message: ERRORS.CATEGORY_NAME_ALREADY_EXISTS.message,
      });
    }

    const created = await this.prisma.category.create({
      data: {
        name: command.name,
        slug: command.slug,
        description: command.description ?? null,
        image: command.image ?? null,
        sortOrder: command.sortOrder ?? 0,
        isActive: command.isActive ?? true,
      },
    });

    await this.catalogCacheService.clearMenuCategoriesCache();

    return this.toCategoryDetailResult(created);
  }

  async update(
    id: string,
    command: Omit<UpdateCategoryCommand, 'id'>,
  ): Promise<CategoryDetailResult> {
    const current = await this.prisma.category.findUnique({ where: { id } });

    if (!current) {
      throw new AppRpcException({
        code: ERRORS.CATEGORY_NOT_FOUND.code,
        message: ERRORS.CATEGORY_NOT_FOUND.message,
      });
    }

    if (command.name && command.name !== current.name) {
      const existedByName = await this.prisma.category.findFirst({
        where: {
          name: command.name,
          NOT: { id },
        },
      });

      if (existedByName) {
        throw new AppRpcException({
          code: ERRORS.CATEGORY_NAME_ALREADY_EXISTS.code,
          message: ERRORS.CATEGORY_NAME_ALREADY_EXISTS.message,
        });
      }
    }

    if (command.slug && command.slug !== current.slug) {
      const existedBySlug = await this.prisma.category.findFirst({
        where: {
          slug: command.slug,
          NOT: { id },
        },
      });

      if (existedBySlug) {
        throw new AppRpcException({
          code: ERRORS.CATEGORY_SLUG_ALREADY_EXISTS.code,
          message: ERRORS.CATEGORY_SLUG_ALREADY_EXISTS.message,
        });
      }
    }

    const data: {
      name?: string;
      slug?: string;
      description?: string;
      image?: string;
      sortOrder?: number;
    } = {};

    if (command.name !== undefined) data.name = command.name;
    if (command.slug !== undefined) data.slug = command.slug;
    if (command.description !== undefined)
      data.description = command.description;
    if (command.image !== undefined) data.image = command.image;
    if (command.sortOrder !== undefined) data.sortOrder = command.sortOrder;

    if (Object.keys(data).length === 0) {
      return this.toCategoryDetailResult(current);
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data,
    });

    await this.catalogCacheService.clearMenuCategoriesCache();

    return this.toCategoryDetailResult(updated);
  }

  async findOne(id: string): Promise<CategoryDetailResult> {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new AppRpcException({
        code: ERRORS.CATEGORY_NOT_FOUND.code,
        message: ERRORS.CATEGORY_NOT_FOUND.message,
      });
    }

    return this.toCategoryDetailResult(category);
  }

  async findAll(
    query: ListCategoriesQuery,
  ): Promise<PaginatedCategoriesResult> {
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
            ],
          }
        : {}),
      ...(typeof query.isActive === 'boolean'
        ? { isActive: query.isActive }
        : {}),
    };

    const sortBy = query.sortBy ?? 'sortOrder';
    const sortOrder = query.sortOrder ?? 'asc';
    const orderBy = {
      [sortBy]: sortOrder,
    } as Record<string, 'asc' | 'desc'>;

    const [items, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toCategoryDetailResult(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMenuCategories(): Promise<MenuCategorySimpleResult[]> {
    const cached = await this.catalogCacheService.getMenuCategories();
    if (cached !== null) {
      return cached;
    }

    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
        menuItems: {
          some: {
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const result = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));

    await this.catalogCacheService.setMenuCategories(result);

    return result;
  }

  async setActive(
    id: string,
    isActive: boolean,
  ): Promise<CategoryDetailResult> {
    const current = await this.prisma.category.findUnique({ where: { id } });

    if (!current) {
      throw new AppRpcException({
        code: ERRORS.CATEGORY_NOT_FOUND.code,
        message: ERRORS.CATEGORY_NOT_FOUND.message,
      });
    }

    const updated = await this.prisma.category.update({
      where: { id },
      data: { isActive },
    });

    await this.catalogCacheService.clearMenuCategoriesCache();

    return this.toCategoryDetailResult(updated);
  }

  async remove(id: string): Promise<DeleteCategoryResult> {
    const current = await this.prisma.category.findUnique({ where: { id } });

    if (!current) {
      throw new AppRpcException({
        code: ERRORS.CATEGORY_NOT_FOUND.code,
        message: ERRORS.CATEGORY_NOT_FOUND.message,
      });
    }

    const menuItemCount = await this.prisma.menuItem.count({
      where: { categoryId: id },
    });

    if (menuItemCount > 0) {
      throw new AppRpcException({
        code: ERRORS.CONFLICT.code,
        message: 'Category has menu items, cannot delete',
      });
    }

    await this.prisma.category.delete({ where: { id } });
    await this.catalogCacheService.clearMenuCategoriesCache();

    return {
      id,
      deleted: true,
    };
  }

  private toCategoryDetailResult(category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    sortOrder: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): CategoryDetailResult {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
