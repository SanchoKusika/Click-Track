import type { CookieOptions, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import ms, { type StringValue } from 'ms';

export const REFRESH_COOKIE_NAME = 'refresh_token';

export function buildRefreshCookieOptions(
  configService: ConfigService,
): CookieOptions {
  const expiresIn = configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN');
  const maxAge = ms(expiresIn as StringValue);
  const secure = configService.get<boolean>('COOKIE_SECURE') ?? false;

  return {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: typeof maxAge === 'number' ? maxAge : undefined,
  };
}

export function setRefreshCookie(
  response: Response,
  configService: ConfigService,
  refreshToken: string,
): void {
  response.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    buildRefreshCookieOptions(configService),
  );
}

export function clearRefreshCookie(
  response: Response,
  configService: ConfigService,
): void {
  const { maxAge: _ignored, ...rest } =
    buildRefreshCookieOptions(configService);
  void _ignored;
  response.clearCookie(REFRESH_COOKIE_NAME, rest);
}
