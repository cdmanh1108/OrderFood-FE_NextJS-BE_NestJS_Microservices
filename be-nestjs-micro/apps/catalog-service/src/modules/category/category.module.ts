import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CatalogCacheModule } from '../cache/catalog-cache.module';

@Module({
  imports: [CatalogCacheModule],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoryModule {}
