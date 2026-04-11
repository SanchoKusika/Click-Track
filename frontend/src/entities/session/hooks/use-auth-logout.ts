import { useMutation } from '@tanstack/react-query';
import { authControllerLogout } from '@shared/api/generated_api';
import { useSessionStore } from '../model/store';
import type { SessionState } from '../model/types';

export function useAuthLogout() {
  const clearSession = useSessionStore((state: SessionState) => state.clearSession);

  return useMutation({
    mutationKey: ['auth-logout'],
    mutationFn: authControllerLogout,
    onSettled: () => {
      clearSession();
    },
  });
}
