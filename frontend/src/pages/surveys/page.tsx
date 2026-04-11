import { SurveyListPanel } from '@features/surveys/survey-list';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@shared/ui/page-header';

export function SurveysPage() {
  const { t } = useTranslation();

  return (
    <section className="space-y-6">
      <PageHeader
        description={t('surveys.page.description')}
        eyebrow={t('surveys.page.eyebrow')}
        title={t('surveys.page.title')}
      />
      <SurveyListPanel />
    </section>
  );
}
