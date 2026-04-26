import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useSessionStore } from '@entities/session';
import type { SessionState } from '@entities/session/model/types';
import { refreshAccessToken, usersControllerMe } from '@shared/api';

export function SessionBootstrap({ children }: PropsWithChildren) {
  const setBootstrapping = useSessionStore((state: SessionState) => state.setBootstrapping);
  const setHydrated = useSessionStore((state: SessionState) => state.setHydrated);
  const setSession = useSessionStore((state: SessionState) => state.setSession);
  const clearSession = useSessionStore((state: SessionState) => state.clearSession);

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      setBootstrapping(true);
      try {
        const tokens = await refreshAccessToken(controller.signal);
        setSession({ accessToken: tokens.accessToken, user: tokens.user });

        try {
          const user = await usersControllerMe();
          setSession({ accessToken: tokens.accessToken, user });
        } catch {
          // Keep the user shape returned by /auth/refresh if /users/me fails.
        }
      } catch {
        clearSession();
      } finally {
        if (!controller.signal.aborted) {
          setBootstrapping(false);
          setHydrated(true);
        }
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [clearSession, setBootstrapping, setHydrated, setSession]);

  return children;
}
