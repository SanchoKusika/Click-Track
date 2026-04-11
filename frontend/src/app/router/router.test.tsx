import { render, screen, waitFor } from '@testing-library/react';
import { AppRouter } from '@/app/router';
import { useSessionStore } from '@entities/session';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWrapper } from '../../test-utils';

vi.mock('@pages/admin-create-user/page', () => ({
  AdminCreateUserPage: () => <div>Admin create stub</div>,
}));

vi.mock('@pages/admin-manage-users/page', () => ({
  AdminManageUsersPage: () => <div>Admin manage stub</div>,
}));

vi.mock('@pages/login/page', () => ({
  LoginPage: () => <div>Login stub</div>,
}));

vi.mock('@shared/api/generated_api', () => ({
  authControllerLogout: vi.fn(() => Promise.resolve({ success: true })),
  assessmentsControllerListAllInterns: vi.fn(() => Promise.resolve([])),
  assessmentsControllerListMentorInterns: vi.fn(() => Promise.resolve([])),
  usersControllerMe: vi.fn(() => {
    const currentUser = useSessionStore.getState().user;

    return Promise.resolve(
      currentUser ?? {
        id: 'mentor-1',
        email: 'mentor@click.local',
        fullName: 'Mentor One',
        role: 'MENTOR',
        createdAt: '2026-04-02T11:04:44.276Z',
      }
    );
  }),
}));

describe('AppRouter', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    localStorage.clear();
    useSessionStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      hasHydrated: true,
      isBootstrapping: false,
    });
  });

  it('redirects unauthenticated users to login', async () => {
    render(<AppRouter />, { wrapper: createWrapper(['/dashboard']) });
    expect(await screen.findByText(/Login stub/i)).toBeInTheDocument();
  });

  it('renders mentor dashboard for mentor role', async () => {
    useSessionStore.setState({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: {
        id: 'mentor-1',
        email: 'mentor@click.local',
        fullName: 'Mentor One',
        role: 'MENTOR',
        createdAt: '2026-04-02T11:04:44.276Z',
      },
      hasHydrated: true,
      isBootstrapping: false,
    });

    render(<AppRouter />, { wrapper: createWrapper(['/dashboard']) });

    expect(await screen.findByRole('heading', { name: /^Assigned interns$/i })).toBeInTheDocument();
  });

  it('renders all interns page for mentor role', async () => {
    useSessionStore.setState({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: {
        id: 'mentor-1',
        email: 'mentor@click.local',
        fullName: 'Mentor One',
        role: 'MENTOR',
        createdAt: '2026-04-02T11:04:44.276Z',
      },
      hasHydrated: true,
      isBootstrapping: false,
    });

    render(<AppRouter />, { wrapper: createWrapper(['/dashboard/interns']) });

    expect(await screen.findByRole('heading', { name: /Platform intern roster/i })).toBeInTheDocument();
  });

  it('redirects to role home when role mismatches route', async () => {
    useSessionStore.setState({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: {
        id: 'intern-1',
        email: 'intern@click.local',
        fullName: 'Intern One',
        role: 'INTERN',
        createdAt: '2026-04-02T11:04:44.276Z',
      },
      hasHydrated: true,
      isBootstrapping: false,
    });

    render(<AppRouter />, { wrapper: createWrapper(['/dashboard']) });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^My Progress$/i })).toBeInTheDocument();
    });
  });

  it('redirects intern away from mentor all interns route', async () => {
    useSessionStore.setState({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: {
        id: 'intern-1',
        email: 'intern@click.local',
        fullName: 'Intern One',
        role: 'INTERN',
        createdAt: '2026-04-02T11:04:44.276Z',
      },
      hasHydrated: true,
      isBootstrapping: false,
    });

    render(<AppRouter />, { wrapper: createWrapper(['/dashboard/interns']) });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /^My Progress$/i })).toBeInTheDocument();
    });
  });
});
