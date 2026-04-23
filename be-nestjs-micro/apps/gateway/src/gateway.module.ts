import { Module } from '@nestjs/common';
import { AuthGatewayModule } from './modules/auth-gateway/auth/auth-gateway.module';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './gateway.controller';
import { MediaGatewayModule } from './modules/media-gateway/media-gateway.module';
import { CatalogGatewayModule } from './modules/catalog-gateway/catalog-gateway.module';
import { LoggerModule } from '@app/logger';
import { UserGatewayModule } from './modules/auth-gateway/user/user-gateway.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    AuthGatewayModule,
    UserGatewayModule,
    CatalogGatewayModule,
    MediaGatewayModule,
  ],
  controllers: [GatewayController],
})
export class GatewayModule {}
