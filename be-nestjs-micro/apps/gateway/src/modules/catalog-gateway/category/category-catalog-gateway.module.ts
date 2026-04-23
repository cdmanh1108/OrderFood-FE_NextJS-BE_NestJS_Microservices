import { Module } from '@nestjs/common';
import { CategoryCatalogGatewayService } from './category-catalog-gateway.service';
import { CategoryCatalogGatewayController } from './category-catalog-gateway.controller';
import { CatalogRmqClientModule } from '../catalog-rmq-client.module';

@Module({
  imports: [CatalogRmqClientModule],
  controllers: [CategoryCatalogGatewayController],
  providers: [CategoryCatalogGatewayService],
})
export class CategoryCatalogGatewayModule {}
