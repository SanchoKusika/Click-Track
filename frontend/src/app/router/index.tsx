import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from '@/app/layouts/public-layout/ui/public-layout';
import { AdminCreateUserPage } from '@pages/admin-create-user/page';
import { AdminManageUsersPage } from '@pages/admin-manage-users/page';
import { AdminSurveysPage } from '@pages/admin-surveys/page';
import { DashboardPage } from '@pages/dashboard/page';
import { LoginPage } from '@pages/login/page';
import { MePage } from '@pages/me/page';
import { MentorInternPage } from '@pages/mentor-intern/page';
import { SettingsPage } from '@pages/settings/page';
import { SurveyFillPage } from '@pages/survey-fill/page';
import { SurveysPage } from '@pages/surveys/page';
import { AppLayout } from '@widgets/layout/ui/app-layout';
import { APP_ROUTES } from '@shared/config/routes';
import { ProtectedRoute } from './protected-route';
import ListAllInternsPage from '@/pages/all-interns/page';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={APP_ROUTES.login} element={<LoginPage />} />
      </Route>
      <Route path="/" element={<AppLayout />}>
        <Route
          path="dashboard"
          element={
            <ProtectedRoute role="MENTOR">
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/interns"
          element={
            <ProtectedRoute role="MENTOR">
              <ListAllInternsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="dashboard/intern/:internId"
          element={
            <ProtectedRoute role="MENTOR">
              <MentorInternPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="me"
          element={
            <ProtectedRoute role="INTERN">
              <MePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute role={['ADMIN', 'MENTOR', 'INTERN']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="admin/users" element={<Navigate to={APP_ROUTES.adminCreateUser} replace />} />
        <Route
          path="admin/users/create"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminCreateUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/users/manage"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminManageUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/surveys"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminSurveysPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="surveys"
          element={
            <ProtectedRoute role={['MENTOR', 'INTERN']}>
              <SurveysPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="surveys/:id"
          element={
            <ProtectedRoute role={['MENTOR', 'INTERN']}>
              <SurveyFillPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to={APP_ROUTES.login} replace />} />
    </Routes>
  );
}
