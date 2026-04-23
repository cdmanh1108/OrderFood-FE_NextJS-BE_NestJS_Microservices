import { Module } from '@nestjs/common/decorators/modules/module.decorator';
import { CategoryCatalogGatewayModule } from './category/category-catalog-gateway.module';
import { MenuItemCatalogGatewayModule } from './menu-item/menu-item-catalog-gateway.module';

@Module({
  imports: [CategoryCatalogGatewayModule, MenuItemCatalogGatewayModule],
})
export class CatalogGatewayModule {}
