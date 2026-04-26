import { create } from 'zustand';
import { setAccessTokenGetter } from '@shared/api/api-instance';
import type { SessionState } from './types';

export const useSessionStore = create<SessionState>(set => ({
  accessToken: null,
  user: null,
  hasHydrated: false,
  isBootstrapping: false,
  setSession: session => {
    set({
      accessToken: session.accessToken,
      user: session.user,
    });
  },
  setUser: user => {
    set({ user });
  },
  clearSession: () => {
    set({ accessToken: null, user: null });
  },
  setHydrated: value => set({ hasHydrated: value }),
  setBootstrapping: value => set({ isBootstrapping: value }),
}));

setAccessTokenGetter(() => useSessionStore.getState().accessToken);
