import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@app/auth';
import { AuthGatewayService } from './auth-gateway.service';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.dto';
import { VerifyEmailRequestDto } from './dto/request/verify-email.request.dto';
import { UpdateUserProfileRequestDto } from './dto/request/update-user-profile.request.dto';
import type { Request } from 'express';
import type { Response } from 'express';
import { clearAuthCookies, setAuthCookies } from './auth-cookie.util';

@Controller('auth')
export class AuthGatewayController {
  constructor(private readonly authGatewayService: AuthGatewayService) {}

  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authGatewayService.login(dto);

    if (result.accessToken && result.refreshToken) {
      setAuthCookies(response, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } else {
      clearAuthCookies(response);
    }

    return result;
  }

  @Post('register')
  async register(
    @Body() dto: RegisterRequestDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authGatewayService.register(dto, request);

    if (result.accessToken && result.refreshToken) {
      setAuthCookies(response, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } else {
      clearAuthCookies(response);
    }

    return result;
  }

  @Post('verify-email')
  async verifyEmail(
    @Body() dto: VerifyEmailRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authGatewayService.verifyEmail(dto);

    if (result.accessToken && result.refreshToken) {
      setAuthCookies(response, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    }

    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    clearAuthCookies(response);

    return {
      loggedOut: true,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: RequestWithUser) {
    const user = request.user;

    if (!user) {
      return null;
    }

    return this.authGatewayService.getProfile(user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() request: RequestWithUser,
    @Body() dto: UpdateUserProfileRequestDto,
  ) {
    if (!request.user) {
      return null;
    }

    return this.authGatewayService.updateProfile({
      id: request.user.sub,
      ...dto,
    });
  }

  //   @Get('profile')
  //   async getProfile(@Headers('x-user-id') userId: string) {
  //     return this.authGatewayService.getProfile(userId);
  //   }
}
