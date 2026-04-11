export * from './hooks/use-auth-login';
export * from './hooks/use-auth-logout';
export * from './hooks/use-auth-refresh';
export * from './hooks/use-current-user-query';
export * from './model/store';
export * from './model/types';
import { useSessionStore } from './model/store';
import type { SessionState } from './model/types';

export function useCurrentUser() {
  return useSessionStore((state: SessionState) => state.user);
}
