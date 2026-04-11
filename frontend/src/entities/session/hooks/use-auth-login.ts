import { useMutation } from '@tanstack/react-query';
import { authControllerLogin, type LoginDto } from '@shared/api/generated_api';
import { useSessionStore } from '../model/store';
import type { SessionState } from '../model/types';

export function useAuthLogin() {
  const setSession = useSessionStore((state: SessionState) => state.setSession);

  return useMutation({
    mutationKey: ['auth-login'],
    mutationFn: (payload: LoginDto) => authControllerLogin(payload),
    onSuccess: data => {
      setSession(data);
    },
    retry: false,
  });
}
