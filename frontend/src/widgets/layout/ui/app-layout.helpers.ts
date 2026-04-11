import { APP_ROUTES } from '@shared/config/routes';
import { SUPPORTED_LANGUAGES } from '@shared/i18n';
import { IconClipboard, IconDashboard, IconPlus, IconTrend, IconUsers } from './app-layout.icons';
import type { AppRole, NavItem, Translate } from './app-layout.types';

export function getTopbarTitle(pathname: string, t: Translate) {
  if (pathname.startsWith(APP_ROUTES.allInterns)) return t('layout.titles.allInterns');
  if (pathname.startsWith(`${APP_ROUTES.dashboard}/intern`)) return t('layout.titles.interns');
  if (pathname.startsWith(APP_ROUTES.dashboard)) return t('layout.titles.overview');
  if (pathname.startsWith(APP_ROUTES.me)) return t('layout.titles.myProgress');
  if (pathname.startsWith(APP_ROUTES.settings)) return t('layout.titles.settings');
  if (pathname.startsWith(APP_ROUTES.adminCreateUser)) return t('layout.titles.createUser');
  if (pathname.startsWith(APP_ROUTES.adminManageUsers)) return t('layout.titles.manageUsers');
  if (pathname.startsWith(APP_ROUTES.adminSurveys)) return t('layout.titles.surveys');
  if (pathname.startsWith(APP_ROUTES.surveys)) return t('layout.titles.surveys');

  return t('layout.titles.workspace');
}

export function getNavItems(role: AppRole, t: Translate): NavItem[] {
  if (role === 'MENTOR') {
    return [
      {
        href: APP_ROUTES.dashboard,
        label: t('layout.nav.dashboard'),
        icon: IconDashboard,
        isActive: pathname => pathname === APP_ROUTES.dashboard,
      },
      {
        href: APP_ROUTES.allInterns,
        label: t('layout.nav.allInterns'),
        icon: IconUsers,
        isActive: pathname =>
          pathname.startsWith(APP_ROUTES.allInterns) || pathname.startsWith(`${APP_ROUTES.dashboard}/intern/`),
      },
      {
        href: APP_ROUTES.surveys,
        label: t('layout.nav.surveys'),
        icon: IconClipboard,
        isActive: pathname => pathname.startsWith(APP_ROUTES.surveys),
      },
    ];
  }

  if (role === 'INTERN') {
    return [
      {
        href: APP_ROUTES.me,
        label: t('layout.nav.progress'),
        icon: IconTrend,
        isActive: pathname => pathname.startsWith(APP_ROUTES.me),
      },
      {
        href: APP_ROUTES.surveys,
        label: t('layout.nav.surveys'),
        icon: IconClipboard,
        isActive: pathname => pathname.startsWith(APP_ROUTES.surveys),
      },
    ];
  }

  if (role === 'ADMIN') {
    return [
      {
        href: APP_ROUTES.adminCreateUser,
        label: t('layout.nav.createUser'),
        icon: IconPlus,
        isActive: pathname => pathname.startsWith(APP_ROUTES.adminCreateUser),
      },
      {
        href: APP_ROUTES.adminManageUsers,
        label: t('layout.nav.manageUsers'),
        icon: IconUsers,
        isActive: pathname => pathname.startsWith(APP_ROUTES.adminManageUsers),
      },
      {
        href: APP_ROUTES.adminSurveys,
        label: t('layout.nav.surveys'),
        icon: IconClipboard,
        isActive: pathname => pathname.startsWith(APP_ROUTES.adminSurveys),
      },
    ];
  }

  return [];
}

export function getSelectedLanguage(resolvedLanguage: string | undefined) {
  const normalizedLanguage = resolvedLanguage?.toLowerCase().split('-')[0] ?? 'ru';
  return SUPPORTED_LANGUAGES.includes(normalizedLanguage as (typeof SUPPORTED_LANGUAGES)[number])
    ? normalizedLanguage
    : 'ru';
}

export function getRoleLabel(role: AppRole, t: Translate) {
  if (role === 'MENTOR') return t('roles.mentor');
  if (role === 'ADMIN') return t('roles.admin');
  if (role === 'INTERN') return t('roles.intern');

  return t('roles.none');
}

export function getRoleChipLabel(role: AppRole, t: Translate) {
  if (role === 'MENTOR') return t('roles.mentor');
  if (role === 'ADMIN') return t('roles.admin');
  if (role === 'INTERN') return t('roles.intern');

  return t('roles.guest');
}
