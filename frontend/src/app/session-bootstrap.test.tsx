import { render, waitFor } from '@testing-library/react';
import { useSessionStore } from '@entities/session';
import { authControllerRefresh, usersControllerMe } from '@shared/api/generated_api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionBootstrap } from './session-bootstrap';

vi.mock('@shared/api/generated_api', () => ({
  authControllerRefresh: vi.fn(),
  usersControllerMe: vi.fn(),
}));

const STORAGE_KEY = 'click_intern_session';

const mentorUser = {
  id: 'mentor-1',
  email: 'mentor@click.local',
  fullName: 'Mentor One',
  role: 'MENTOR' as const,
  createdAt: '2026-04-02T11:04:44.276Z',
};

describe('SessionBootstrap', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: false,
      isBootstrapping: false,
    });
    vi.clearAllMocks();
  });

  it('hydrates immediately when there is no persisted session', async () => {
    render(
      <SessionBootstrap>
        <div>content</div>
      </SessionBootstrap>
    );

    await waitFor(() => {
      expect(useSessionStore.getState().hasHydrated).toBe(true);
      expect(useSessionStore.getState().isBootstrapping).toBe(false);
    });

    expect(vi.mocked(usersControllerMe)).not.toHaveBeenCalled();
    expect(vi.mocked(authControllerRefresh)).not.toHaveBeenCalled();
  });

  it('loads current user when access token is persisted', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: null,
      })
    );
    vi.mocked(usersControllerMe).mockResolvedValueOnce(mentorUser);

    render(
      <SessionBootstrap>
        <div>content</div>
      </SessionBootstrap>
    );

    await waitFor(() => {
      expect(vi.mocked(usersControllerMe)).toHaveBeenCalledTimes(1);
      expect(useSessionStore.getState().user?.id).toBe('mentor-1');
      expect(useSessionStore.getState().hasHydrated).toBe(true);
    });

    expect(vi.mocked(authControllerRefresh)).not.toHaveBeenCalled();
  });

  it('refreshes token and retries user fetch when /users/me fails', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: 'stale-access',
        refreshToken: 'refresh-token',
        user: null,
      })
    );

    vi.mocked(usersControllerMe).mockRejectedValueOnce(new Error('unauthorized')).mockResolvedValueOnce(mentorUser);
    vi.mocked(authControllerRefresh).mockResolvedValueOnce({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      user: mentorUser,
    });

    render(
      <SessionBootstrap>
        <div>content</div>
      </SessionBootstrap>
    );

    await waitFor(() => {
      expect(vi.mocked(authControllerRefresh)).toHaveBeenCalledWith({
        refreshToken: 'refresh-token',
      });
      expect(vi.mocked(usersControllerMe)).toHaveBeenCalledTimes(2);
      expect(useSessionStore.getState().accessToken).toBe('new-access');
      expect(useSessionStore.getState().refreshToken).toBe('new-refresh');
      expect(useSessionStore.getState().user?.id).toBe('mentor-1');
      expect(useSessionStore.getState().hasHydrated).toBe(true);
      expect(useSessionStore.getState().isBootstrapping).toBe(false);
    });
  });

  it('clears session when both me and refresh requests fail', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: 'stale-access',
        refreshToken: 'refresh-token',
        user: mentorUser,
      })
    );

    vi.mocked(usersControllerMe).mockRejectedValueOnce(new Error('unauthorized'));
    vi.mocked(authControllerRefresh).mockRejectedValueOnce(new Error('refresh failed'));

    render(
      <SessionBootstrap>
        <div>content</div>
      </SessionBootstrap>
    );

    await waitFor(() => {
      expect(useSessionStore.getState().accessToken).toBeNull();
      expect(useSessionStore.getState().refreshToken).toBeNull();
      expect(useSessionStore.getState().user).toBeNull();
      expect(useSessionStore.getState().hasHydrated).toBe(true);
      expect(useSessionStore.getState().isBootstrapping).toBe(false);
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
