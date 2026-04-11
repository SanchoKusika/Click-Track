import { useNavigate } from 'react-router-dom';
import { useAuthLogout } from '@entities/session';
import { APP_ROUTES } from '@shared/config/routes';

export function useLogout() {
  const navigate = useNavigate();
  const logoutMutation = useAuthLogout();

  return async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      navigate(APP_ROUTES.login, { replace: true });

      return;
    }

    navigate(APP_ROUTES.login, { replace: true });
  };
}
