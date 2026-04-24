// import { Injectable } from '@nestjs/common';
// import { RedisService } from '@app/redis';
// import { createHash } from 'crypto';

// @Injectable()
// export class CatalogCacheService {
//   private readonly categoryListTtl = 300;

//   constructor(private readonly redisService: RedisService) {}

//   private hash(value: unknown): string {
//     return createHash('md5').update(JSON.stringify(value)).digest('hex');
//   }

//   getCategoryListKey(query: unknown): string {
//     return `catalog:categories:list:${this.hash(query)}`;
//   }

//   async getCategoryList<T>(query: unknown): Promise<T | null> {
//     return this.redisService.getJson<T>(this.getCategoryListKey(query));
//   }

//   async setCategoryList<T>(query: unknown, data: T): Promise<void> {
//     await this.redisService.setJson(
//       this.getCategoryListKey(query),
//       data,
//       this.categoryListTtl,
//     );
//   }

//   async clearCategoryListCache(): Promise<void> {
//     await this.redisService.delByPattern('catalog:categories:list:*');
//   }
// }
