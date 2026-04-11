import { useMutation } from '@tanstack/react-query';
import { authControllerRefresh, type RefreshTokenDto } from '@shared/api/generated_api';
import { useSessionStore } from '../model/store';
import type { SessionState } from '../model/types';

export function useAuthRefresh() {
  const setSession = useSessionStore((state: SessionState) => state.setSession);

  return useMutation({
    mutationKey: ['auth-refresh'],
    mutationFn: (payload: RefreshTokenDto) => authControllerRefresh(payload),
    onSuccess: data => {
      setSession(data);
    },
  });
}
