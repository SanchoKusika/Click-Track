import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMySettingsQuery } from '@entities/settings';
import { useCurrentUser } from '@entities/session';
import { useLogout } from '@features/auth/model/use-logout';
import { APP_ROUTES } from '@shared/config/routes';
import { useTheme } from '@shared/lib/use-theme';
import { Button } from '@shared/ui/heroui';
import { useTranslation } from 'react-i18next';
import { getNavItems, getRoleChipLabel, getRoleLabel, getSelectedLanguage, getTopbarTitle } from './app-layout.helpers';
import { LayoutHeader } from './layout-header';
import { LayoutSidebar } from './layout-sidebar';

import styles from './styles.module.css';

export function AppLayout() {
  const { i18n, t } = useTranslation();
  const user = useCurrentUser();
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();
  const role = user?.role ?? null;
  const navigate = useNavigate();
  const location = useLocation();
  const settingsQuery = useMySettingsQuery(Boolean(user));

  const navItems = getNavItems(role, t);
  const topbarTitle = getTopbarTitle(location.pathname, t);
  const selectedLanguage = getSelectedLanguage(i18n.resolvedLanguage);
  const roleLabel = getRoleLabel(role, t);
  const roleChipLabel = getRoleChipLabel(role, t);
  const userFullName = user?.fullName ?? t('roles.guest');
  const avatarName = user?.fullName ?? 'G';
  const avatarSrc = settingsQuery.data?.photoUrl ?? null;

  return (
    <div className={styles.layout}>
      <div className={styles.flexWrapper}>
        <LayoutSidebar
          navItems={navItems}
          onLogout={logout}
          onNavigate={href => navigate(href)}
          pathname={location.pathname}
          t={t}
        />

        <main className={styles.main}>
          <LayoutHeader
            avatarName={avatarName}
            avatarSrc={avatarSrc}
            navItems={navItems}
            onLanguageChange={language => {
              void i18n.changeLanguage(language);
            }}
            onNavigate={href => navigate(href)}
            onOpenSettings={() => navigate(APP_ROUTES.settings)}
            onToggleTheme={toggleTheme}
            pathname={location.pathname}
            roleChipLabel={roleChipLabel}
            roleLabel={roleLabel}
            selectedLanguage={selectedLanguage}
            t={t}
            theme={theme}
            title={topbarTitle}
            userFullName={userFullName}
          />

          <div className={styles.pageContent}>
            <Outlet />
          </div>
          <div className={styles.mobileFooter}>
            <Button fullWidth onPress={logout} radius="lg" variant="outline">
              {t('layout.logout')}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
