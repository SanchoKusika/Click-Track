import { useState } from 'react';
import { useAdminSurveysQuery, useDeleteSurveyMutation, useSurveyResponsesQuery } from '@entities/surveys';
import type { SurveyListItem } from '@entities/surveys';
import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, Chip } from '@shared/ui/heroui';
import { RatingStars } from '@shared/ui/rating-stars';
import { PanelState } from '@shared/ui/panel-state';

import styles from '../../../styles.module.css';

function SurveyResponsesPanel({ surveyId }: { surveyId: string }) {
  const { t } = useTranslation();
  const { data, isLoading } = useSurveyResponsesQuery(surveyId);

  if (isLoading) return <p className="text-sm text-(--muted)">{t('admin.surveys.list.loadingResponses')}</p>;
  if (!data?.length) {
    return (
      <PanelState
        description={t('admin.surveys.list.noResponsesDescription')}
        title={t('admin.surveys.list.noResponsesTitle')}
      />
    );
  }

  return (
    <div className="space-y-4">
      {data.map(r => (
        <Card className={styles.editCard} key={r.id} radius="xl">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-semibold text-(--text)">{r.respondent.fullName}</p>
                <p className="text-sm text-(--muted)">{r.respondent.email}</p>
              </div>
              {r.mentorName ? (
                <Chip radius="full" size="sm" variant="soft">
                  {t('admin.surveys.list.mentorPrefix', { name: r.mentorName })}
                </Chip>
              ) : null}
            </div>

            {/* Criteria answers */}
            {r.answers.length > 0 ? (
              <div className="space-y-3">
                {r.answers.map(a => (
                  <div className="flex gap-4" key={a.questionId}>
                    {/* Left: criterion + stars */}
                    <div className="shrink-0 w-44 space-y-1">
                      <p className="text-sm font-medium text-(--text)">{a.questionTitle}</p>
                      <RatingStars size="sm" value={a.score ?? 0} />
                    </div>
                    {/* Right: comment */}
                    <div className="flex-1 bg-(--surface-2) rounded-xl px-4 py-3">
                      {a.comment ? (
                        <div className="text-sm text-(--muted)" dangerouslySetInnerHTML={{ __html: a.comment }} />
                      ) : (
                        <p className="text-sm text-(--muted)">{t('admin.surveys.list.emptyAnswer')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Intern text comment */}
            {r.comment ? (
              <p className="text-sm text-(--text) bg-(--surface-2) rounded-xl px-4 py-3">{r.comment}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SurveyRow({
  survey,
  isDeleting,
  onDelete,
}: {
  survey: SurveyListItem;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const [showResponses, setShowResponses] = useState(false);

  return (
    <Card className={styles.editCard} radius="lg">
      <CardContent className="p-4 space-y-3">
        <div className={styles.editCardHeader}>
          <div className="space-y-1">
            <p className={styles.editCardTitle}>{survey.title}</p>
            <div className="flex items-center gap-2">
              <Chip color={survey.target === 'MENTOR' ? 'primary' : 'secondary'} radius="full" size="sm" variant="soft">
                {survey.target === 'MENTOR' ? t('admin.surveys.list.mentor') : t('admin.surveys.list.intern')}
              </Chip>
              <span className="text-xs text-(--muted)">
                {survey.target === 'MENTOR'
                  ? t('admin.surveys.list.criteriaCount', { count: survey.questionCount })
                  : t('admin.surveys.list.fieldsCount', { count: survey.questionCount })}{' '}
                · {t('admin.surveys.list.responsesCount', { count: survey.responseCount })}
              </span>
            </div>
          </div>

          <div className={styles.actionsRow}>
            <Button
              radius="lg"
              size="sm"
              variant={showResponses ? 'primary' : 'outline'}
              onPress={() => setShowResponses(v => !v)}
            >
              {showResponses ? t('admin.surveys.list.hideResponses') : t('admin.surveys.list.viewResponses')}
            </Button>
            <Button isPending={isDeleting} radius="lg" size="sm" variant="danger" onPress={onDelete}>
              {t('admin.surveys.list.delete')}
            </Button>
          </div>
        </div>

        {showResponses ? <SurveyResponsesPanel surveyId={survey.id} /> : null}
      </CardContent>
    </Card>
  );
}

export function SurveysList() {
  const { t } = useTranslation();
  const surveys = useAdminSurveysQuery();
  const deleteSurvey = useDeleteSurveyMutation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setDeletingId(id);
    void deleteSurvey.mutateAsync(id).finally(() => setDeletingId(null));
  }

  if (surveys.isLoading) {
    return <p className="text-sm text-(--muted)">{t('admin.surveys.list.loadingSurveys')}</p>;
  }

  const list = surveys.data ?? [];

  if (!list.length) {
    return (
      <PanelState
        description={t('admin.surveys.list.noSurveysDescription')}
        title={t('admin.surveys.list.noSurveysTitle')}
      />
    );
  }

  return (
    <div className="space-y-3">
      {list.map(s => (
        <SurveyRow key={s.id} isDeleting={deletingId === s.id} survey={s} onDelete={() => handleDelete(s.id)} />
      ))}
    </div>
  );
}
