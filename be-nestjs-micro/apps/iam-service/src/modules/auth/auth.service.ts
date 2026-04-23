import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IamPrismaService } from '@app/database';
import { JwtPayload, JwtService } from '@app/auth';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { LoginCommandDto } from '@app/contracts/iam/auth/commands/login.command.dto';
import { RegisterCommandDto } from '@app/contracts/iam/auth/commands/register.command.dto';
import { RefreshTokenCommandDto } from '@app/contracts/iam/auth/commands/refresh-token.command.dto';
import { LoginResultDto } from '@app/contracts/iam/auth/results/login.result.dto';
import { RegisterResultDto } from '@app/contracts/iam/auth/results/register.result.dto';
import { UserRole } from '@app/contracts/iam/auth/enums/user-role.enum';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';

type LegacyRole = UserRole | 'EMPLOYEE';

function normalizeUserRole(role: string): UserRole {
  switch (role as LegacyRole) {
    case UserRole.ADMIN:
      return UserRole.ADMIN;
    case UserRole.STAFF:
    case 'EMPLOYEE':
      return UserRole.STAFF;
    case UserRole.USER:
    default:
      return UserRole.USER;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: IamPrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginCommandDto): Promise<LoginResultDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new AppRpcException({
        code: ERRORS.AUTH_INVALID_CREDENTIALS.code,
        message: ERRORS.AUTH_INVALID_CREDENTIALS.message,
      });
    }

    const isPasswordMatched = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordMatched) {
      throw new AppRpcException({
        code: ERRORS.AUTH_INVALID_CREDENTIALS.code,
        message: ERRORS.AUTH_INVALID_CREDENTIALS.message,
      });
    }

    const role = normalizeUserRole(user.role);

    const payload: JwtPayload = {
      sub: user.id,
      role,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.signAccessToken(payload),
      refreshToken: this.jwtService.signRefreshToken(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName ?? null,
        role,
      },
    };
  }

  async register(dto: RegisterCommandDto): Promise<RegisterResultDto> {
    const existedUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existedUser) {
      throw new AppRpcException({
        code: ERRORS.USER_EMAIL_ALREADY_EXISTS.code,
        message: ERRORS.USER_EMAIL_ALREADY_EXISTS.message,
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const createdUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
      },
    });

    const role = normalizeUserRole(createdUser.role);

    const payload: JwtPayload = {
      sub: createdUser.id,
      role,
      email: createdUser.email,
    };

    return {
      accessToken: this.jwtService.signAccessToken(payload),
      refreshToken: this.jwtService.signRefreshToken(payload),
      user: {
        id: createdUser.id,
        email: createdUser.email,
        fullName: createdUser.fullName ?? null,
        role,
      },
    };
  }

  refresh(dto: RefreshTokenCommandDto) {
    try {
      const payload = this.jwtService.verifyRefreshToken(dto.refreshToken);

      return {
        accessToken: this.jwtService.signAccessToken({
          sub: payload.sub,
          role: payload.role,
          email: payload.email,
        }),
      };
    } catch {
      throw new AppRpcException({
        code: ERRORS.AUTH_UNAUTHORIZED.code,
        message: 'Refresh token khong hop le',
      });
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    if (!user) {
      throw new AppRpcException({
        code: ERRORS.USER_NOT_FOUND.code,
        message: ERRORS.USER_NOT_FOUND.message,
      });
    }

    return user;
  }
}
