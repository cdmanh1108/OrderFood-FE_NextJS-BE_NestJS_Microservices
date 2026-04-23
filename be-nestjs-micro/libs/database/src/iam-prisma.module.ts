import { Global, Module } from '@nestjs/common';
import { IamPrismaService } from './iam-prisma.service';

@Global()
@Module({
  providers: [IamPrismaService],
  exports: [IamPrismaService],
})
export class IamPrismaModule {}
