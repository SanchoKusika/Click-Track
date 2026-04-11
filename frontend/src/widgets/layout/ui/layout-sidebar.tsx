import clickLogo from '@/assets/click-logo.svg';
import { IconLogout, IconSupport } from './app-layout.icons';
import type { NavItem, Translate } from './app-layout.types';

import styles from './styles.module.css';

type LayoutSidebarProps = {
  navItems: NavItem[];
  pathname: string;
  onNavigate: (href: string) => void;
  onLogout: () => void;
  t: Translate;
};

export function LayoutSidebar({ navItems, onLogout, onNavigate, pathname, t }: LayoutSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.brandGroup}>
          <img src={clickLogo} alt={t('layout.brandLogoAlt')} className={styles.brandLogo} />
          <div className={styles.brandTitle}>{t('layout.brandTitle')}</div>
        </div>
        <nav className={styles.nav}>
          {navItems.map(item => {
            const isActive = item.isActive(pathname);

            return (
              <button
                className={`${styles.navButton} ${isActive ? styles.navButtonActive : styles.navButtonInactive}`}
                key={item.label}
                onClick={() => onNavigate(item.href)}
                type="button"
              >
                {item.icon(isActive)}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className={styles.sidebarFooter}>
        <button className={styles.footerButton} type="button">
          <IconSupport />
          <span>{t('layout.support')}</span>
        </button>
        <button className={styles.footerButton} onClick={onLogout} type="button">
          <IconLogout />
          <span>{t('layout.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
