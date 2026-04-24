import { MenuItemSimpleResult } from '@app/contracts/catalog/menu-item/results/menu-item-simple.result';
import { MenuCategorySimpleResult } from '@app/contracts/catalog/menu-item/results/menu-category-simple.result';
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { RedisService } from 'libs/redis';

@Injectable()
export class CatalogCacheService {
  private readonly menuTtl: number = 43200;

  constructor(private readonly redisService: RedisService) {}

  private hash(value: unknown): string {
    return createHash('md5')
      .update(JSON.stringify(value ?? {}))
      .digest('hex');
  }

  getMenuKey(query: unknown): string {
    return `catalog:menu:v2:find:${this.hash(query)}`;
  }

  async getMenu(query: unknown): Promise<MenuItemSimpleResult[] | null> {
    return this.redisService.getJson(this.getMenuKey(query));
  }

  async setMenu(query: unknown, data: MenuItemSimpleResult[]): Promise<void> {
    await this.redisService.setJson(this.getMenuKey(query), data, this.menuTtl);
  }

  getMenuCategoriesKey(): string {
    return 'catalog:menu:categories';
  }

  async getMenuCategories(): Promise<MenuCategorySimpleResult[] | null> {
    return this.redisService.getJson(this.getMenuCategoriesKey());
  }

  async setMenuCategories(data: MenuCategorySimpleResult[]): Promise<void> {
    await this.redisService.setJson(
      this.getMenuCategoriesKey(),
      data,
      this.menuTtl,
    );
  }

  async clearMenuCache(): Promise<void> {
    await this.redisService.delByPattern('catalog:menu:*');
  }

  async clearMenuCategoriesCache(): Promise<void> {
    await this.redisService.del(this.getMenuCategoriesKey());
  }
}
