import { Avatar, Button, Chip, ToggleButton, ToggleButtonGroup } from '@shared/ui/heroui';
import { SUPPORTED_LANGUAGES } from '@shared/i18n';

import flagRU from '@/assets/icons/flags/RU.svg';
import flagGB from '@/assets/icons/flags/GB.svg';
import flagUZ from '@/assets/icons/flags/UZ.svg';

const LANGUAGE_META: Record<string, { flag: string; code: string }> = {
  ru: { flag: flagRU, code: 'RU' },
  en: { flag: flagGB, code: 'EN' },
  uz: { flag: flagUZ, code: 'UZ' },
};

import { IconBell, IconMoon, IconSettings, IconSun } from './app-layout.icons';
import type { NavItem, Translate } from './app-layout.types';

import styles from './styles.module.css';

type LayoutHeaderProps = {
  navItems: NavItem[];
  pathname: string;
  title: string;
  selectedLanguage: string;
  roleLabel: string;
  roleChipLabel: string;
  userFullName: string;
  avatarName: string;
  avatarSrc: string | null;
  theme: 'dark' | 'light';
  onNavigate: (href: string) => void;
  onOpenSettings: () => void;
  onLanguageChange: (language: string) => void;
  onToggleTheme: () => void;
  t: Translate;
};

export function LayoutHeader({
  navItems,
  onLanguageChange,
  onNavigate,
  onOpenSettings,
  onToggleTheme,
  avatarName,
  avatarSrc,
  pathname,
  roleChipLabel,
  roleLabel,
  selectedLanguage,
  t,
  theme,
  title,
  userFullName,
}: LayoutHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>{title}</h1>
        </div>

        <div className={styles.headerActions}>
          <Button isDisabled className={styles.actionButton} radius="full" size="sm" variant="light">
            <IconBell />
          </Button>

          <ToggleButtonGroup
            aria-label={t('language.label')}
            className={styles.languagePicker}
            disallowEmptySelection
            selectedKeys={new Set([selectedLanguage])}
            selectionMode="single"
            size="sm"
            onSelectionChange={(keys: Set<string>) => {
              const lang = [...keys][0];
              if (lang) onLanguageChange(lang);
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang, index) => (
              <ToggleButton id={lang} key={lang}>
                {index > 0 && <ToggleButtonGroup.Separator />}
                <span className="flex items-center gap-1.5">
                  <img
                    alt=""
                    aria-hidden="true"
                    className="h-3 w-4 rounded-[2px] object-cover"
                    src={LANGUAGE_META[lang]?.flag}
                  />
                  <span className="tracking-wide">{LANGUAGE_META[lang]?.code}</span>
                </span>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <div aria-label={t('layout.theme.toggle')} className={styles.themeToggle} role="group">
            <div className={styles.themeToggleIndicator} data-theme={theme} />
            <button
              aria-label={t('layout.theme.switchToDark')}
              aria-pressed={theme === 'dark'}
              className={`${styles.themeToggleBtn} ${styles.themeToggleMoon}`}
              data-active={theme === 'dark'}
              type="button"
              onClick={onToggleTheme}
            >
              <IconMoon />
            </button>
            <button
              aria-label={t('layout.theme.switchToLight')}
              aria-pressed={theme === 'light'}
              className={`${styles.themeToggleBtn} ${styles.themeToggleSun}`}
              data-active={theme === 'light'}
              type="button"
              onClick={onToggleTheme}
            >
              <IconSun />
            </button>
          </div>

          <Button
            aria-label={t('layout.openSettings')}
            className={styles.actionButton}
            radius="full"
            size="sm"
            variant="light"
            onPress={onOpenSettings}
          >
            <IconSettings />
          </Button>

          <div className={styles.userProfile}>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{userFullName}</div>
              <div className={styles.userRole}>{roleLabel}</div>
            </div>
            <Avatar className={styles.userAvatar} name={avatarName} size="sm" src={avatarSrc ?? undefined} />
          </div>
        </div>
      </div>

      {navItems.length > 0 ? (
        <div className={styles.mobileNav}>
          <div className={styles.mobileNavContent}>
            {navItems.map(item => {
              const isActive = item.isActive(pathname);

              return (
                <button
                  className={`${styles.mobileNavButton} ${
                    isActive ? styles.mobileNavButtonActive : styles.mobileNavButtonInactive
                  }`}
                  key={`${item.label}-mobile`}
                  onClick={() => onNavigate(item.href)}
                  type="button"
                >
                  {item.icon(isActive)}
                  <span>{item.label}</span>
                </button>
              );
            })}
            <Chip className={styles.mobileRoleChip} color="default" radius="full" size="sm" variant="soft">
              {roleChipLabel}
            </Chip>
          </div>
        </div>
      ) : null}
    </header>
  );
}
