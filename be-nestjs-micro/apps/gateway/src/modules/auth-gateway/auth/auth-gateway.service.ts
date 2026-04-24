import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { LoginRequestDto } from './dto/request/login.request.dto';
import { RegisterRequestDto } from './dto/request/register.dto';
import { VerifyEmailRequestDto } from './dto/request/verify-email.request.dto';
import { LoginResultDto } from '@app/contracts/iam/auth/results/login.result.dto';
import { RegisterResultDto } from '@app/contracts/iam/auth/results/register.result.dto';
import { VerifyEmailResultDto } from '@app/contracts/iam/auth/results/verify-email.result.dto';
import { LoginCommandDto } from '@app/contracts/iam/auth/commands/login.command.dto';
import { RegisterCommandDto } from '@app/contracts/iam/auth/commands/register.command.dto';
import { VerifyEmailCommandDto } from '@app/contracts/iam/auth/commands/verify-email.command.dto';
import { IAM_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { getOrCreateRequestId } from '@app/logger/utils/request-context.util';
import type { Request } from 'express';

@Injectable()
export class AuthGatewayService {
  constructor(
    @Inject('IAM_SERVICE')
    private readonly iamClient: ClientProxy,
  ) {}

  async login(payload: LoginRequestDto): Promise<LoginResultDto> {
    const command: LoginCommandDto = {
      email: payload.email,
      password: payload.password,
    };
    return firstValueFrom(
      this.iamClient
        .send<LoginResultDto, LoginCommandDto>(IAM_PATTERNS.LOGIN, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async register(
    payload: RegisterRequestDto,
    request: Request,
  ): Promise<RegisterResultDto> {
    const requestId = getOrCreateRequestId(request.headers['x-request-id']);
    const command: RegisterCommandDto = {
      requestId,
      email: payload.email,
      password: payload.password,
      fullName: payload.fullName,
    };
    return firstValueFrom(
      this.iamClient
        .send<
          RegisterResultDto,
          RegisterCommandDto
        >(IAM_PATTERNS.REGISTER, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async verifyEmail(
    payload: VerifyEmailRequestDto,
  ): Promise<VerifyEmailResultDto> {
    const command: VerifyEmailCommandDto = {
      email: payload.email,
      code: payload.code,
    };

    return firstValueFrom(
      this.iamClient
        .send<
          VerifyEmailResultDto,
          VerifyEmailCommandDto
        >(IAM_PATTERNS.VERIFY_EMAIL, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  // async getProfile(userId: string) {
  //   return firstValueFrom(this.iamClient.send('iam.profile.get', { userId }));
  // }
}
