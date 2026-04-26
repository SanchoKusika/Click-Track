import type { AuthTokensResponseDto } from './generated_api';
import { customInstance } from './api-instance';

export function refreshAccessToken(signal?: AbortSignal): Promise<AuthTokensResponseDto> {
  return customInstance<AuthTokensResponseDto>({
    url: '/auth/refresh',
    method: 'POST',
    signal,
  });
}
