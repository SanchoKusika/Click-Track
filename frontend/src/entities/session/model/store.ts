import { create } from 'zustand';
import { sessionService } from './session.service';
import type { SessionState } from './types';

export const useSessionStore = create<SessionState>((set, get) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  hasHydrated: false,
  isBootstrapping: false,
  setSession: session => {
    sessionService.setSession(session);
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    });
  },
  setUser: user => {
    const currentSession = sessionService.getSession();

    if (currentSession) {
      sessionService.setSession({ ...currentSession, user });
    }

    set({ user });
  },
  clearSession: () => {
    sessionService.clearSession();
    set({ accessToken: null, refreshToken: null, user: null });
  },
  bootstrapSession: (): { accessToken: string | null; refreshToken: string | null } => {
    const current = get();
    if (current.accessToken || current.user) {
      return { accessToken: current.accessToken, refreshToken: current.refreshToken };
    }

    const persistedSession = sessionService.getSession();
    const accessToken = persistedSession?.accessToken ?? null;
    const refreshToken = persistedSession?.refreshToken ?? null;
    const user = persistedSession?.user ?? null;

    set({ accessToken, refreshToken, user });

    return { accessToken, refreshToken };
  },
  setHydrated: value => set({ hasHydrated: value }),
  setBootstrapping: value => set({ isBootstrapping: value }),
}));
