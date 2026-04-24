/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '../jwt/jwt.service';

const ACCESS_TOKEN_COOKIE = 'access_token';

function getAuthorizationToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

function getCookieToken(cookieHeader?: string): string | null {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';');

  for (const cookie of cookies) {
    const [rawKey, ...rawValueParts] = cookie.trim().split('=');

    if (rawKey !== ACCESS_TOKEN_COOKIE) {
      continue;
    }

    const rawValue = rawValueParts.join('=');
    return rawValue ? decodeURIComponent(rawValue) : null;
  }

  return null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const authorization = req.headers['authorization'] as string | undefined;
    const cookieHeader = req.headers['cookie'] as string | undefined;

    const token =
      getAuthorizationToken(authorization) ?? getCookieToken(cookieHeader);

    if (!token) {
      return false;
    }

    try {
      const payload = this.jwt.verifyAccessToken(token);
      req.user = payload;
      return true;
    } catch {
      return false;
    }
  }
}
