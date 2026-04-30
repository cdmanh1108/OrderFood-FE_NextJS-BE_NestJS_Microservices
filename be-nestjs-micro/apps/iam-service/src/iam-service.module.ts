import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { IamPrismaModule } from '@app/database';
import { LoggerModule } from '@app/logger';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.iam-service' }),
    LoggerModule,
    IamPrismaModule,
    AuthModule,
    UserModule,
  ],
})
export class IamServiceModule {}
