import type { Response } from 'express';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

const ACCESS_TOKEN_MAX_AGE_MS = 5 * 60 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type CookieSameSite = 'lax' | 'strict' | 'none';

function getCookieSameSite(): CookieSameSite {
  const value = (process.env.AUTH_COOKIE_SAMESITE ?? 'lax').toLowerCase();

  if (value === 'none' || value === 'strict' || value === 'lax') {
    return value;
  }

  return 'lax';
}

function getCookieSecure(): boolean {
  if (typeof process.env.AUTH_COOKIE_SECURE === 'string') {
    return process.env.AUTH_COOKIE_SECURE === 'true';
  }

  return process.env.NODE_ENV === 'production';
}

function getCookieDomain(): string | undefined {
  const value = process.env.AUTH_COOKIE_DOMAIN?.trim();
  return value ? value : undefined;
}

function getCookieBaseOptions() {
  return {
    httpOnly: true,
    sameSite: getCookieSameSite(),
    secure: getCookieSecure(),
    path: '/',
    domain: getCookieDomain(),
  } as const;
}

export function setAuthCookies(
  response: Response,
  tokens: { accessToken: string; refreshToken: string },
): void {
  const baseOptions = getCookieBaseOptions();

  response.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  });

  response.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  });
}

export function clearAuthCookies(response: Response): void {
  const baseOptions = getCookieBaseOptions();

  response.clearCookie(ACCESS_TOKEN_COOKIE, baseOptions);
  response.clearCookie(REFRESH_TOKEN_COOKIE, baseOptions);
}

export const AUTH_COOKIE_NAMES = {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} as const;
