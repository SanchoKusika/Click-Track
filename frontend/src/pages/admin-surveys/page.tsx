import { CreateSurveyForm } from '@features/admin/surveys/create-survey';
import { SurveysList } from '@features/admin/surveys/manage-surveys';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@shared/ui/page-header';

export function AdminSurveysPage() {
  const { t } = useTranslation();

  return (
    <section className="space-y-6">
      <PageHeader
        description={t('admin.surveysPage.description')}
        eyebrow={t('admin.common.control')}
        title={t('admin.surveysPage.title')}
      />
      <div className="grid grid-cols-2 gap-6 items-start">
        <CreateSurveyForm />
        <SurveysList />
      </div>
    </section>
  );
}
