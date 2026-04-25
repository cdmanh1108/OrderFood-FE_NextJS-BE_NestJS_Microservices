import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { AuthService } from './auth.service';
import type { LoginCommandDto } from '@app/contracts/iam/auth/commands/login.command.dto';
import type { RegisterCommandDto } from '@app/contracts/iam/auth/commands/register.command.dto';
import type { VerifyEmailCommandDto } from '@app/contracts/iam/auth/commands/verify-email.command.dto';
// import type { RefreshTokenCommandDto } from '@app/contracts/iam/auth/commands/refresh-token.command.dto';
import { handleRpcMessage } from '@app/messaging/rmq/rpc-message.helper';
import { IAM_PATTERNS } from '@app/messaging/constants/patterns.constant';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(IAM_PATTERNS.LOGIN)
  login(@Payload() dto: LoginCommandDto, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.authService.login(dto));
  }

  @MessagePattern(IAM_PATTERNS.REGISTER)
  register(@Payload() dto: RegisterCommandDto, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.authService.register(dto));
  }

  @MessagePattern(IAM_PATTERNS.VERIFY_EMAIL)
  verifyEmail(
    @Payload() dto: VerifyEmailCommandDto,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.authService.verifyEmail(dto));
  }

  // @MessagePattern(IAM_PATTERNS.REFRESH)
  // refresh(@Payload() dto: RefreshTokenCommandDto, @Ctx() context: RmqContext) {
  //   return handleRpcMessage(context, () => this.authService.refresh(dto));
  // }

  // @MessagePattern(IAM_PATTERNS.GET_PROFILE)
  // getProfile(
  //   @Payload() payload: { userId: string },
  //   @Ctx() context: RmqContext,
  // ) {
  //   return handleRpcMessage(context, () =>
  //     this.authService.getProfile(payload.userId),
  //   );
  // }
}
