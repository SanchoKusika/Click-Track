import { create } from 'zustand';
import {
  setAccessTokenGetter,
  setRefreshHandler,
  setSessionExpiredHandler,
} from '@shared/api/api-instance';
import { refreshAccessToken } from '@shared/api/auth';
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

setRefreshHandler(async () => {
  const tokens = await refreshAccessToken();
  useSessionStore.getState().setSession({
    accessToken: tokens.accessToken,
    user: tokens.user,
  });
  return tokens.accessToken;
});

setSessionExpiredHandler(() => {
  useSessionStore.getState().clearSession();
});
