export const APP_ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  me: '/me',
  settings: '/settings',
  adminUsers: '/admin/users',
  allInterns: '/dashboard/interns',
  adminCreateUser: '/admin/users/create',
  adminManageUsers: '/admin/users/manage',
  adminSurveys: '/admin/surveys',
  surveys: '/surveys',
  surveyFill: (id: string) => `/surveys/${id}`,
  mentorIntern: (internId: string) => `/dashboard/intern/${internId}`,
} as const;

export function getDefaultRouteByRole(role: 'ADMIN' | 'MENTOR' | 'INTERN') {
  if (role === 'MENTOR') return APP_ROUTES.dashboard;
  if (role === 'INTERN') return APP_ROUTES.me;

  return APP_ROUTES.adminCreateUser;
}
