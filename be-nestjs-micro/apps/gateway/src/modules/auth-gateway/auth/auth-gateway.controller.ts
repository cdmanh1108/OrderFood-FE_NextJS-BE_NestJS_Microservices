import { Body, Controller, Post } from '@nestjs/common';
import { AuthGatewayService } from './auth-gateway.service';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.dto';
import { LoginResultDto } from '@app/contracts/iam/auth/results/login.result.dto';
import { RegisterResultDto } from '@app/contracts/iam/auth/results/register.result.dto';

@Controller('auth')
export class AuthGatewayController {
  constructor(private readonly authGatewayService: AuthGatewayService) {}

  @Post('login')
  async login(@Body() dto: LoginRequestDto): Promise<LoginResultDto> {
    return this.authGatewayService.login(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterRequestDto): Promise<RegisterResultDto> {
    return this.authGatewayService.register(dto);
  }

  //   @Get('profile')
  //   async getProfile(@Headers('x-user-id') userId: string) {
  //     return this.authGatewayService.getProfile(userId);
  //   }
}
