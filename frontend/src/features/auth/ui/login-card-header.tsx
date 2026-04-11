import clickLogo from '@/assets/click-logo.svg';
import { CardHeader } from '@shared/ui/heroui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

export function LoginCardHeader() {
  const { t } = useTranslation();

  return (
    <CardHeader className={styles.cardHeader}>
      <div className={styles.logoWrapper}>
        <img src={clickLogo} alt={t('layout.brandLogoAlt')} className="h-24 w-24" />
      </div>
      <div className={styles.titleGroup}>
        <div className={styles.title}>{t('layout.brandTitle')}</div>
        <div className={styles.subtitle}>{t('auth.login.subtitle')}</div>
      </div>
    </CardHeader>
  );
}
