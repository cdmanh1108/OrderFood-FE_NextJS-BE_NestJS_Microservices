import { UnauthorizedException } from '@nestjs/common';
import type { RequestWithUser } from '@app/auth';
import { ERRORS } from '@app/common/constants/error-code.constant';

export function getUserIdOrThrow(request: RequestWithUser): string {
  const userId = request.user?.sub;
  if (!userId) {
    throw new UnauthorizedException({
      code: ERRORS.UNAUTHORIZED.code,
      message: ERRORS.UNAUTHORIZED.message,
    });
  }

  return userId;
}
