import { Body, Controller, Post, Req } from '@nestjs/common';
import { AuthGatewayService } from './auth-gateway.service';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.dto';
import { VerifyEmailRequestDto } from './dto/request/verify-email.request.dto';
import type { Request } from 'express';

@Controller('auth')
export class AuthGatewayController {
  constructor(private readonly authGatewayService: AuthGatewayService) {}

  @Post('login')
  async login(@Body() dto: LoginRequestDto) {
    return this.authGatewayService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterRequestDto, @Req() request: Request) {
    return this.authGatewayService.register(dto, request);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailRequestDto) {
    return this.authGatewayService.verifyEmail(dto);
  }

  //   @Get('profile')
  //   async getProfile(@Headers('x-user-id') userId: string) {
  //     return this.authGatewayService.getProfile(userId);
  //   }
}
