import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

export function LoginFooter() {
  const { t } = useTranslation();

  return (
    <div className={styles.footer}>
      <p className={styles.footerText}>
        {t('auth.login.footerText')} <span className={styles.footerLink}>{t('auth.login.footerLink')}</span>
      </p>
    </div>
  );
}
