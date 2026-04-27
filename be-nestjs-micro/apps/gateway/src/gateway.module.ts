import { Module } from '@nestjs/common';
import { AuthGatewayModule } from './modules/auth-gateway/auth/auth-gateway.module';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './gateway.controller';
import { MediaGatewayModule } from './modules/media-gateway/media-gateway.module';
import { CatalogGatewayModule } from './modules/catalog-gateway/catalog-gateway.module';
import { LoggerModule } from '@app/logger';
import { UserGatewayModule } from './modules/auth-gateway/user/user-gateway.module';
import { OrderingGatewayModule } from './modules/ordering-gateway/ordering-gateway.module';
import { AuthModule } from '@app/auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    AuthModule,
    AuthGatewayModule,
    UserGatewayModule,
    CatalogGatewayModule,
    MediaGatewayModule,
    OrderingGatewayModule,
  ],
  controllers: [GatewayController],
})
export class GatewayModule {}
