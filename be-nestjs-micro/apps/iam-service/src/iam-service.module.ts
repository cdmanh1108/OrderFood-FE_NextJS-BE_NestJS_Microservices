import { Module } from '@nestjs/common';
import { IamServiceController } from './iam-service.controller';
import { IamServiceService } from './iam-service.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { IamPrismaModule } from '@app/database';
import { LoggerModule } from '@app/logger/logger.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.iam-service' }),
    LoggerModule,
    IamPrismaModule,
    AuthModule,
    UserModule,
  ],
  controllers: [IamServiceController],
  providers: [IamServiceService],
})
export class IamServiceModule {}
