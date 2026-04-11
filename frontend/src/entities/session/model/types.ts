import type { AuthTokensResponseDto, PublicUserDto } from '@shared/api/generated_api';

export type SessionUser = PublicUserDto;

export type SessionPayload = Pick<AuthTokensResponseDto, 'accessToken' | 'refreshToken' | 'user'>;

export type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  hasHydrated: boolean;
  isBootstrapping: boolean;
  setSession: (session: SessionPayload) => void;
  setUser: (user: SessionUser) => void;
  clearSession: () => void;
  bootstrapSession: () => { accessToken: string | null; refreshToken: string | null };
  setHydrated: (value: boolean) => void;
  setBootstrapping: (value: boolean) => void;
};
