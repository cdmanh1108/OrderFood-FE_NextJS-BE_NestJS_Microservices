import { Module } from '@nestjs/common';
import { CatalogServiceController } from './catalog-service.controller';
import { CatalogServiceService } from './catalog-service.service';
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
  controllers: [CatalogServiceController],
  providers: [CatalogServiceService],
})
export class CatalogServiceModule {}
