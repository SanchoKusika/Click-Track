import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser, useSessionStore } from '@entities/session';
import type { SessionState } from '@entities/session/model/types';
import { useTranslation } from 'react-i18next';
import { getDefaultRouteByRole } from '@shared/config/routes';

type Role = 'ADMIN' | 'MENTOR' | 'INTERN';

type Props = {
  role?: Role | Role[];
  children: ReactElement;
};

export function ProtectedRoute({ children, role }: Props) {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const accessToken = useSessionStore((state: SessionState) => state.accessToken);
  const hasHydrated = useSessionStore((state: SessionState) => state.hasHydrated);
  const isBootstrapping = useSessionStore((state: SessionState) => state.isBootstrapping);

  if (!hasHydrated || isBootstrapping) {
    return <div className="p-8 text-sm text-slate-500">{t('protectedRoute.loadingSession')}</div>;
  }
  if (!accessToken || !currentUser) return <Navigate to="/login" replace />;
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(currentUser.role)) {
      return <Navigate to={getDefaultRouteByRole(currentUser.role)} replace />;
    }
  }

  return children;
}
