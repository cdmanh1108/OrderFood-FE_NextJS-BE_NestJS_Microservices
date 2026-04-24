import { Module } from '@nestjs/common';
import { CategoryModule } from './modules/category/category.module';
import { MenuItemModule } from './modules/menu-item/menu-item.module';
import { ConfigModule } from '@nestjs/config';
import { CatalogPrismaModule } from '@app/database/catalog-prisma.module';
import { LoggerModule } from '@app/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.catalog-service',
    }),
    LoggerModule,
    CategoryModule,
    MenuItemModule,
    CatalogPrismaModule,
  ],
})
export class CatalogServiceModule {}
