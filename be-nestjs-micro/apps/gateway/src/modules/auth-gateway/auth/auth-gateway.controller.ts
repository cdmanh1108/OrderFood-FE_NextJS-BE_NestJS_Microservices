import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import type { JwtPayload } from '@app/auth/interfaces/jwt-payload.interface';
import { AuthGatewayService } from './auth-gateway.service';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.dto';
import { VerifyEmailRequestDto } from './dto/request/verify-email.request.dto';
import type { Request } from 'express';
import type { Response } from 'express';
import { clearAuthCookies, setAuthCookies } from './auth-cookie.util';

type RequestWithUser = Request & {
  user?: JwtPayload;
};

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
  me(@Req() request: RequestWithUser) {
    const user = request.user;

    if (!user) {
      return null;
    }

    return {
      id: user.sub,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isEmailVerified: true,
    };
  }

  //   @Get('profile')
  //   async getProfile(@Headers('x-user-id') userId: string) {
  //     return this.authGatewayService.getProfile(userId);
  //   }
}
