import { Card, CardContent, Chip } from '@shared/ui/heroui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

const RULES: { role: 'INTERN' | 'MENTOR' | 'ADMIN'; descriptionKey: string }[] = [
  { role: 'INTERN', descriptionKey: 'admin.setupCard.rules.intern' },
  { role: 'MENTOR', descriptionKey: 'admin.setupCard.rules.mentor' },
  { role: 'ADMIN', descriptionKey: 'admin.setupCard.rules.admin' },
];

const ROLE_COLOR = {
  INTERN: 'success',
  MENTOR: 'accent',
  ADMIN: 'warning',
} as const;

const NOTE_KEYS = ['admin.setupCard.notes.email', 'admin.setupCard.notes.roleMentor', 'admin.setupCard.notes.password'];

export function CreateUserInfoCard() {
  const { t } = useTranslation();

  return (
    <Card className={styles.card} radius="xl">
      <CardContent className={styles.content}>
        <div className={styles.titleRow}>
          <div className={styles.iconWrapper}>
            <svg
              fill="none"
              height="20"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
              width="20"
            >
              <path d="M10.3 5.7L3.2 18a2 2 0 0 0 1.7 3h14.2a2 2 0 0 0 1.7-3L13.7 5.7a2 2 0 0 0-3.4 0z" />
              <path d="M12 10v4M12 18h.01" />
            </svg>
          </div>
          <div className={styles.heading}>{t('admin.setupCard.title')}</div>
        </div>
        <p className={styles.subheading}>{t('admin.setupCard.subtitle')}</p>

        <div className={styles.rulesList}>
          {RULES.map(rule => (
            <div className={styles.ruleItem} key={rule.role}>
              <Chip color={ROLE_COLOR[rule.role]} size="sm" variant="soft">
                {t(`roles.byCode.${rule.role}`)}
              </Chip>
              <p className={styles.ruleText}>{t(rule.descriptionKey)}</p>
            </div>
          ))}
        </div>

        <div className={styles.divider} />

        <ul className={styles.notesList}>
          {NOTE_KEYS.map(note => (
            <li className={styles.noteItem} key={note}>
              <span className={styles.noteDot} />
              {t(note)}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
