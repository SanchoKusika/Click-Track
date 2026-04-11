import { useParams } from 'react-router-dom';
import { SurveyFillForm } from '@features/surveys/survey-form';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@shared/ui/page-header';

export function SurveyFillPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  if (!id) return null;

  return (
    <section className="space-y-6">
      <PageHeader
        description={t('surveys.fill.description')}
        eyebrow={t('surveys.fill.eyebrow')}
        title={t('surveys.fill.title')}
      />
      <SurveyFillForm surveyId={id} />
    </section>
  );
}
