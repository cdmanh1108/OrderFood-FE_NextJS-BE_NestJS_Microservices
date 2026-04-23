import { Module } from '@nestjs/common';
import { MenuItemCatalogGatewayController } from './menu-item-catalog-gateway.controller';
import { MenuItemCatalogGatewayService } from './menu-item-catalog-gateway.service';
import { CatalogRmqClientModule } from '../catalog-rmq-client.module';

@Module({
  imports: [CatalogRmqClientModule],
  controllers: [MenuItemCatalogGatewayController],
  providers: [MenuItemCatalogGatewayService],
})
export class MenuItemCatalogGatewayModule {}
