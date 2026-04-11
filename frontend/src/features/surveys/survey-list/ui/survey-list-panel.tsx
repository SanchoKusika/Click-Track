import { useNavigate } from 'react-router-dom';
import { useMySurveysQuery } from '@entities/surveys';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Chip } from '@shared/ui/heroui';
import { PanelState } from '@shared/ui/panel-state';
import { APP_ROUTES } from '@shared/config/routes';

export function SurveyListPanel() {
  const { t } = useTranslation();
  const surveys = useMySurveysQuery();
  const navigate = useNavigate();

  if (surveys.isLoading) {
    return <p className="text-sm text-(--muted)">{t('surveys.list.loading')}</p>;
  }

  const list = surveys.data ?? [];

  if (!list.length) {
    return <PanelState description={t('surveys.list.emptyDescription')} title={t('surveys.list.emptyTitle')} />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {list.map(s => (
        <Card className="border border-(--border) bg-(--surface) shadow-none overflow-hidden" key={s.id} radius="xl">
          <div className={`h-1 w-full ${s.isCompleted ? 'bg-emerald-400' : 'bg-(--primary)'}`} />

          <CardContent className="p-4 flex flex-col gap-4 h-full">
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-semibold text-(--text) leading-tight line-clamp-2 flex-1">{s.title}</p>
              {s.isCompleted ? (
                <Chip color="success" radius="full" size="sm" variant="soft">
                  {t('surveys.list.completed')}
                </Chip>
              ) : (
                <Chip color="warning" radius="full" size="sm" variant="soft">
                  {t('surveys.list.pending')}
                </Chip>
              )}
            </div>

            <p className="text-xs text-(--muted) flex-1">
              {t('surveys.list.criteriaCount', { count: s.questions.length })}
            </p>

            {s.isCompleted ? (
              <div className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                <svg
                  className="w-3.5 h-3.5 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {t('surveys.list.completed')}
                </span>
              </div>
            ) : (
              <Button
                className="w-full"
                radius="lg"
                size="sm"
                variant="primary"
                onPress={() => navigate(APP_ROUTES.surveyFill(s.id))}
              >
                {t('surveys.list.fillOut')}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
