import type { SessionPayload } from './types';

const SESSION_KEY = 'click_intern_session';

export class SessionService {
  getSession(): SessionPayload | null {
    const rawValue = localStorage.getItem(SESSION_KEY);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as SessionPayload;
    } catch {
      localStorage.removeItem(SESSION_KEY);

      return null;
    }
  }

  setSession(session: SessionPayload): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  }
}

export const sessionService = new SessionService();
