import { Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSessionStore } from '@entities/session';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWrapper } from '../../../test-utils';
import { LoginForm } from './login-form';

const { mockCurrentUser, mockLogin } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockCurrentUser: vi.fn(),
}));

vi.mock('@shared/api/generated_api', () => ({
  authControllerLogin: mockLogin,
  usersControllerMe: mockCurrentUser,
}));

vi.mock('@gravity-ui/icons', () => {
  const Icon = () => null;

  return {
    Envelope: Icon,
    Eye: Icon,
    EyeSlash: Icon,
  };
});

describe('LoginForm', () => {
  beforeEach(() => {
    localStorage.clear();
    useSessionStore.setState({
      accessToken: null,
      user: null,
      hasHydrated: true,
      isBootstrapping: false,
    });

    mockLogin.mockResolvedValue({
      accessToken: 'token',
      user: {
        id: 'mentor-1',
        email: 'mentor@click.local',
        fullName: 'Mentor One',
        role: 'MENTOR',
        createdAt: '2026-04-02T11:04:44.276Z',
      },
    });

    mockCurrentUser.mockResolvedValue({
      id: 'mentor-1',
      email: 'mentor@click.local',
      fullName: 'Mentor One',
      role: 'MENTOR',
      createdAt: '2026-04-02T11:04:44.276Z',
    });
  });

  it('redirects to dashboard after mentor login', async () => {
    const user = userEvent.setup();

    render(
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<div>Mentor landing</div>} />
      </Routes>,
      { wrapper: createWrapper(['/login']) }
    );

    await user.type(screen.getByPlaceholderText(/name@example.com/i), 'mentor@click.local');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(screen.getByText('Mentor landing')).toBeInTheDocument();
    });
  });
});
