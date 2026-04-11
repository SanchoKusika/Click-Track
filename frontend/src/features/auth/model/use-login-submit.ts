import { useNavigate } from 'react-router-dom';
import { useAuthLogin } from '@entities/session';
import { getDefaultRouteByRole } from '@shared/config/routes';
import type { LoginFormValues } from './login-form.schema';

export function useLoginSubmit() {
  const navigate = useNavigate();
  const loginMutation = useAuthLogin();

  const submit = async (values: LoginFormValues) => {
    const response = await loginMutation.mutateAsync(values);

    navigate(getDefaultRouteByRole(response.user.role), { replace: true });
  };

  return {
    submit,
    loginMutation,
  };
}
