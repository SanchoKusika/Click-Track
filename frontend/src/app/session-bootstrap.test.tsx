import { render, waitFor } from '@testing-library/react';
import { useSessionStore } from '@entities/session';
import { refreshAccessToken } from '@shared/api/auth';
import { usersControllerMe } from '@shared/api/generated_api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionBootstrap } from './session-bootstrap';

vi.mock('@shared/api/auth', () => ({
  refreshAccessToken: vi.fn(),
}));

vi.mock('@shared/api/generated_api', () => ({
  usersControllerMe: vi.fn(),
}));

const mentorUser = {
  id: 'mentor-1',
  email: 'mentor@click.local',
  fullName: 'Mentor One',
  role: 'MENTOR' as const,
  createdAt: '2026-04-02T11:04:44.276Z',
};

describe('SessionBootstrap', () => {
  beforeEach(() => {
    useSessionStore.setState({
      accessToken: null,
      user: null,
      hasHydrated: false,
      isBootstrapping: false,
    });
    vi.clearAllMocks();
  });

  it('clears session when refresh fails (guest)', async () => {
    vi.mocked(refreshAccessToken).mockRejectedValueOnce(new Error('unauthorized'));

    render(
      <SessionBootstrap>
        <div>content</div>
      </SessionBootstrap>
    );

    await waitFor(() => {
      expect(useSessionStore.getState().hasHydrated).toBe(true);
      expect(useSessionStore.getState().isBootstrapping).toBe(false);
    });

    expect(useSessionStore.getState().accessToken).toBeNull();
    expect(useSessionStore.getState().user).toBeNull();
    expect(vi.mocked(usersControllerMe)).not.toHaveBeenCalled();
  });

  it('hydrates session from cookie-based refresh', async () => {
    vi.mocked(refreshAccessToken).mockResolvedValueOnce({
      accessToken: 'access-token',
      user: mentorUser,
    });
    vi.mocked(usersControllerMe).mockResolvedValueOnce(mentorUser);

    render(
      <SessionBootstrap>
        <div>content</div>
      </SessionBootstrap>
    );

    await waitFor(() => {
      expect(useSessionStore.getState().accessToken).toBe('access-token');
      expect(useSessionStore.getState().user?.id).toBe('mentor-1');
      expect(useSessionStore.getState().hasHydrated).toBe(true);
    });
  });

  it('keeps refresh user when /users/me fails', async () => {
    vi.mocked(refreshAccessToken).mockResolvedValueOnce({
      accessToken: 'access-token',
      user: mentorUser,
    });
    vi.mocked(usersControllerMe).mockRejectedValueOnce(new Error('me failed'));

    render(
      <SessionBootstrap>
        <div>content</div>
      </SessionBootstrap>
    );

    await waitFor(() => {
      expect(useSessionStore.getState().accessToken).toBe('access-token');
      expect(useSessionStore.getState().user?.id).toBe('mentor-1');
      expect(useSessionStore.getState().hasHydrated).toBe(true);
    });
  });
});
