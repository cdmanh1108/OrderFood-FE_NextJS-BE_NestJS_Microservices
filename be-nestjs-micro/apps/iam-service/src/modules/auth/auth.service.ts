import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IamPrismaService } from '@app/database';
import { JwtPayload, JwtService } from '@app/auth';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { LoginCommandDto } from '@app/contracts/iam/auth/commands/login.command.dto';
import { RegisterCommandDto } from '@app/contracts/iam/auth/commands/register.command.dto';
import { VerifyEmailCommandDto } from '@app/contracts/iam/auth/commands/verify-email.command.dto';
import { RefreshTokenCommandDto } from '@app/contracts/iam/auth/commands/refresh-token.command.dto';
import { LoginResultDto } from '@app/contracts/iam/auth/results/login.result.dto';
import { RegisterResultDto } from '@app/contracts/iam/auth/results/register.result.dto';
import { VerifyEmailResultDto } from '@app/contracts/iam/auth/results/verify-email.result.dto';
import { UserRole } from '@app/contracts/iam/auth/enums/user-role.enum';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { EmailVerificationService } from './services/email-verification.service';
import { ClientProxy } from '@nestjs/microservices';
import { NOTIFICATION_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { buildRmqEventMessage } from '@app/messaging/rmq/rpc-message.helper';

type LegacyRole = UserRole;

function normalizeUserRole(role: string): UserRole {
  switch (role as LegacyRole) {
    case UserRole.ADMIN:
      return UserRole.ADMIN;
    case UserRole.STAFF:
      return UserRole.STAFF;
    case UserRole.USER:
    default:
      return UserRole.USER;
  }
}

interface AuthUserEntity {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isEmailVerified: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: IamPrismaService,
    private readonly jwtService: JwtService,
    private readonly emailVerificationService: EmailVerificationService,

    @Inject(RMQ_SERVICES.NOTIFICATION)
    private readonly notificationClient: ClientProxy,
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

    if (!user.isEmailVerified) {
      throw new AppRpcException({
        code: ERRORS.AUTH_UNAUTHORIZED.code,
        message: 'Tài khoản chưa được xác thực, hãy đăng ký lại và xác thực',
      });
    }

    const isPasswordMatched = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordMatched) {
      throw new AppRpcException({
        code: ERRORS.AUTH_INVALID_CREDENTIALS.code,
        message: ERRORS.AUTH_INVALID_CREDENTIALS.message,
      });
    }

    return this.buildAuthResult({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isEmailVerified: true,
    });
  }

  async register(dto: RegisterCommandDto): Promise<RegisterResultDto> {
    const existedUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existedUser?.isEmailVerified) {
      throw new AppRpcException({
        code: ERRORS.USER_EMAIL_ALREADY_EXISTS.code,
        message: ERRORS.USER_EMAIL_ALREADY_EXISTS.message,
      });
    }

    let pendingUser = existedUser;

    if (!pendingUser) {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      pendingUser = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          fullName: dto.fullName,
        },
      });
    }

    await this.sendVerificationCode({
      requestId: dto.requestId,
      userId: pendingUser.id,
      email: pendingUser.email,
      fullName: pendingUser.fullName ?? null,
    });

    return this.buildAuthResult({
      id: pendingUser.id,
      email: pendingUser.email,
      fullName: pendingUser.fullName,
      role: pendingUser.role,
      isEmailVerified: false,
    });
  }

  async verifyEmail(dto: VerifyEmailCommandDto): Promise<VerifyEmailResultDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new AppRpcException({
        code: ERRORS.USER_NOT_FOUND.code,
        message: ERRORS.USER_NOT_FOUND.message,
      });
    }

    if (!user.isEmailVerified) {
      const isValidCode = await this.emailVerificationService.verifyCode({
        userId: user.id,
        code: dto.code,
      });

      if (!isValidCode) {
        throw new AppRpcException({
          code: ERRORS.BAD_REQUEST.code,
          message: 'Mã xác thực không hợp lệ hoặc đã hết hạn',
        });
      }

      const verifiedUser = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isEmailVerified: true,
        },
      });

      return this.buildAuthResult({
        id: verifiedUser.id,
        email: verifiedUser.email,
        fullName: verifiedUser.fullName,
        role: verifiedUser.role,
        isEmailVerified: true,
      });
    }

    return this.buildAuthResult({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isEmailVerified: true,
    });
  }

  refresh(dto: RefreshTokenCommandDto) {
    try {
      const payload = this.jwtService.verifyRefreshToken(dto.refreshToken);

      return {
        accessToken: this.jwtService.signAccessToken({
          sub: payload.sub,
          role: payload.role,
          fullName: payload.fullName,
          email: payload.email,
        }),
      };
    } catch {
      throw new AppRpcException({
        code: ERRORS.AUTH_UNAUTHORIZED.code,
        message: 'Refresh token không hợp lệ',
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

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private async sendVerificationCode(input: {
    requestId: string;
    userId: string;
    email: string;
    fullName: string | null;
  }): Promise<void> {
    const verificationCode = this.generateVerificationCode();

    await this.emailVerificationService.saveCode({
      userId: input.userId,
      email: input.email,
      code: verificationCode,
    });

    this.notificationClient.emit(
      NOTIFICATION_PATTERNS.SEND_VERIFY_EMAIL,
      buildRmqEventMessage(
        {
          requestId: input.requestId,
          email: input.email,
          fullName: input.fullName ?? input.email,
          code: verificationCode,
        },
        {
          eventId: input.requestId,
          ttlMs: 10 * 60 * 1000,
        },
      ),
    );
  }

  private buildAuthResult(
    user: AuthUserEntity,
  ): LoginResultDto | RegisterResultDto | VerifyEmailResultDto {
    const role = normalizeUserRole(user.role);
    const tokens = user.isEmailVerified
      ? this.issueTokens({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role,
        })
      : {
          accessToken: null,
          refreshToken: null,
        };

    return {
      isEmailVerified: user.isEmailVerified,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  private issueTokens(input: {
    id: string;
    role: UserRole;
    email: string;
    fullName: string;
  }): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload: JwtPayload = {
      sub: input.id,
      role: input.role,
      fullName: input.fullName,
      email: input.email,
    };

    return {
      accessToken: this.jwtService.signAccessToken(payload),
      refreshToken: this.jwtService.signRefreshToken(payload),
    };
  }
}
