import { useMySettingsQuery } from '@entities/settings';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@shared/ui/heroui';
import { PageHeader } from '@shared/ui/page-header';
import { PanelState } from '@shared/ui/panel-state';

import { SettingsForm } from './ui/settings-form';
import styles from './ui/styles.module.css';

export function SettingsPage() {
  const { t } = useTranslation();
  const settingsQuery = useMySettingsQuery();

  if (settingsQuery.isLoading) {
    return (
      <section className="space-y-6">
        <PageHeader
          description={t('settings.page.description')}
          eyebrow={t('settings.page.eyebrow')}
          title={t('settings.page.title')}
        />
        <PanelState description={t('settings.state.loadingDescription')} title={t('settings.state.loadingTitle')} />
      </section>
    );
  }

  if (settingsQuery.error || !settingsQuery.data) {
    return (
      <section className="space-y-6">
        <PageHeader
          description={t('settings.page.description')}
          eyebrow={t('settings.page.eyebrow')}
          title={t('settings.page.title')}
        />
        <PanelState
          actionLabel={t('settings.actions.retry')}
          description={t('settings.state.errorDescription')}
          title={t('settings.state.errorTitle')}
          tone="danger"
          onAction={() => { void settingsQuery.refetch(); }}
        />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <PageHeader
        description={t('settings.page.description')}
        eyebrow={t('settings.page.eyebrow')}
        title={t('settings.page.title')}
      />

      <Card className={styles.card} radius="xl">
        <CardContent className={styles.cardContent}>
          <SettingsForm data={settingsQuery.data} />
        </CardContent>
      </Card>
    </section>
  );
}
