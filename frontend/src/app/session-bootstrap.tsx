import type { PropsWithChildren } from 'react';
import { useEffect } from 'react';
import { useSessionStore } from '@entities/session';
import type { SessionState } from '@entities/session/model/types';
import { authControllerRefresh, usersControllerMe } from '@shared/api/generated_api';

export function SessionBootstrap({ children }: PropsWithChildren) {
  const bootstrapSession = useSessionStore((state: SessionState) => state.bootstrapSession);
  const setBootstrapping = useSessionStore((state: SessionState) => state.setBootstrapping);
  const setHydrated = useSessionStore((state: SessionState) => state.setHydrated);
  const setSession = useSessionStore((state: SessionState) => state.setSession);
  const setUser = useSessionStore((state: SessionState) => state.setUser);
  const clearSession = useSessionStore((state: SessionState) => state.clearSession);

  useEffect(() => {
    const run = async () => {
      const tokens = bootstrapSession();
      if (!tokens?.accessToken) {
        setHydrated(true);

        return;
      }

      setBootstrapping(true);
      try {
        const user = await usersControllerMe();
        setUser(user);
      } catch {
        if (tokens.refreshToken) {
          try {
            const refreshedSession = await authControllerRefresh({
              refreshToken: tokens.refreshToken,
            });
            const user = await usersControllerMe();

            setSession(refreshedSession);
            setUser(user);
          } catch {
            clearSession();
          }
        } else {
          clearSession();
        }
      } finally {
        setBootstrapping(false);
        setHydrated(true);
      }
    };

    void run();
  }, [bootstrapSession, clearSession, setBootstrapping, setHydrated, setSession, setUser]);

  return children;
}
