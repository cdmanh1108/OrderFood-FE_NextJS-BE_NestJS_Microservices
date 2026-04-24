import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from './jwt/jwt.service';

@Module({
  providers: [AuthService, JwtService],
  exports: [AuthService, JwtService],
})
export class AuthModule {}
