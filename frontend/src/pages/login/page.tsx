import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@features/auth';
import { useCurrentUser } from '@entities/session';
import { getDefaultRouteByRole } from '@shared/config/routes';

export function LoginPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (currentUser) {
      navigate(getDefaultRouteByRole(currentUser.role), { replace: true });
    }
  }, [currentUser, navigate]);

  return <LoginForm />;
}
