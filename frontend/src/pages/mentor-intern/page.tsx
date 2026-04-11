import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { useCreateAssessmentMutation, useMentorInternDetailQuery } from '@entities/mentor';
import { useTranslation } from 'react-i18next';
import { APP_ROUTES } from '@shared/config/routes';
import { formatDate } from '@shared/i18n';
import { resolveApiAssetUrl } from '@shared/api/api-instance';
import { Avatar, Button, Card, CardContent, Skeleton } from '@shared/ui/heroui';
import { PanelState } from '@shared/ui/panel-state';
import { RatingStars } from '@shared/ui/rating-stars';
import { SectionPanel } from '@shared/ui/section-panel';

import styles from './styles.module.css';

type AssessmentFormValues = {
  criterionId: string;
  score: number;
  comment: string;
};

function scoreTier(score: number, maxScore: number): 'high' | 'mid' | 'low' | 'none' {
  if (!score && !maxScore) return 'none';
  const ratio = maxScore === 0 ? 0 : score / maxScore;
  if (ratio >= 0.75) return 'high';
  if (ratio >= 0.4) return 'mid';
  return 'low';
}

export function MentorInternPage() {
  const { i18n, t } = useTranslation();
  const { internId = '' } = useParams();
  const detailQuery = useMentorInternDetailQuery(internId);
  const createAssessment = useCreateAssessmentMutation(internId);

  const defaultCriterionId = detailQuery.data?.criteria[0]?.id ?? '';
  const form = useForm<AssessmentFormValues>({
    defaultValues: { criterionId: defaultCriterionId, score: 5, comment: '' },
  });

  useEffect(() => {
    if (!detailQuery.data?.criteria.length) return;
    const criterion = detailQuery.data.criteria.find(item => item.id === defaultCriterionId);
    form.reset({ criterionId: defaultCriterionId, score: criterion?.maxScore ?? 5, comment: '' });
  }, [defaultCriterionId, detailQuery.data?.criteria, form]);

  const selectedCriterionId = useWatch({ control: form.control, name: 'criterionId' });
  const selectedScore = useWatch({ control: form.control, name: 'score' }) ?? 0;
  const selectedCriterion =
    detailQuery.data?.criteria.find(c => c.id === selectedCriterionId) ?? detailQuery.data?.criteria[0];

  if (detailQuery.isLoading) {
    return (
      <div className={styles.skeletonStack}>
        <Skeleton className={styles.skeletonBreadcrumb} />
        <Skeleton className={styles.skeletonHeader} />
        <Skeleton className={styles.skeletonSection} />
        <Skeleton className={styles.skeletonSection} />
      </div>
    );
  }

  if (!detailQuery.data) {
    return (
      <PanelState
        description={t('mentorIntern.error.description')}
        title={t('mentorIntern.error.title')}
        tone="danger"
      />
    );
  }

  const assessments = detailQuery.data.assessments;
  const averageScore = assessments.length ? assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length : 0;

  const criterionSummary = detailQuery.data.criteria.map(criterion => {
    const items = assessments.filter(a => a.criterion.id === criterion.id);
    const average = items.length ? items.reduce((sum, a) => sum + a.score, 0) / items.length : 0;
    return { criterion, average, entries: items.length, latestComment: items[0]?.comment ?? '' };
  });

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link className={styles.breadcrumbLink} to={APP_ROUTES.dashboard}>
          {t('mentorIntern.breadcrumb.interns')}
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{detailQuery.data.intern.user.fullName}</span>
      </nav>

      <header className={styles.header}>
        <div className={styles.headerGlow} />
        <div className={styles.headerInner}>
          <Avatar
            className={styles.avatar}
            name={detailQuery.data.intern.user.fullName}
            size="lg"
            src={resolveApiAssetUrl(detailQuery.data.intern.user.photoUrl) ?? undefined}
          />
          <div className={styles.headerMeta}>
            <h1 className={styles.headerName}>{detailQuery.data.intern.user.fullName}</h1>
            <p className={styles.headerEmail}>{detailQuery.data.intern.user.email}</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.headerStat}>
              <span className={styles.headerStatValue}>{assessments.length}</span>
              <span className={styles.headerStatLabel}>{t('mentorIntern.stats.assessments')}</span>
            </div>
            <div className={styles.headerStatDivider} />
            <div className={styles.headerStat}>
              <span className={styles.headerStatValue}>{criterionSummary.length}</span>
              <span className={styles.headerStatLabel}>{t('mentorIntern.stats.criteria')}</span>
            </div>
            <div className={styles.headerStatDivider} />
            <div className={styles.headerStat}>
              <span className={styles.headerStatValue}>{averageScore.toFixed(1)}</span>
              <span className={styles.headerStatLabel}>{t('mentorIntern.stats.avgScore')}</span>
            </div>
          </div>
        </div>
      </header>

      <SectionPanel title={t('mentorIntern.skills.title')}>
        <div className={styles.skillsGrid}>
          {criterionSummary.map(item => {
            const ratio = item.criterion.maxScore ? item.average / item.criterion.maxScore : 0;
            const tier = scoreTier(item.average, item.criterion.maxScore);
            return (
              <Card className={styles.skillCard} key={item.criterion.id} radius="lg">
                <CardContent className={styles.skillCardContent}>
                  <div className={styles.skillHeader}>
                    <span className={styles.skillTitle}>{item.criterion.title}</span>
                  </div>

                  <div className={styles.skillStats}>
                    <div className={styles.skillProgressTrack}>
                      <div
                        className={`${styles.skillProgressFill} ${styles[`skillProgressFill--${tier}`]}`}
                        style={{ width: `${Math.round(ratio * 100)}%` }}
                      />
                    </div>

                    <div className={styles.skillScoreRow}>
                      <RatingStars size="sm" value={item.average} />
                      <span className={styles.skillScoreText}>
                        {item.average.toFixed(1)}
                        <span className={styles.skillScoreMax}>/{item.criterion.maxScore}</span>
                      </span>
                    </div>

                    {(item.latestComment || item.criterion.description) && (
                      <p className={styles.skillComment}>{item.latestComment || item.criterion.description}</p>
                    )}
                  </div>

                  <footer className={styles.skillFooter}>
                    <span className={styles.skillFooterLabel}>{t('mentorIntern.skills.recentEntries')}</span>
                    <span className={styles.skillFooterValue}>{item.entries}</span>
                  </footer>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </SectionPanel>

      <SectionPanel
        endContent={
          <div className={styles.globalRating}>
            <span className={styles.globalRatingLabel}>{t('mentorIntern.performance.globalRating')}</span>
            <RatingStars size="sm" value={averageScore} />
          </div>
        }
        subtitle={t('mentorIntern.performance.subtitle')}
        title={t('mentorIntern.performance.title')}
      >
        <div className={styles.performanceGrid}>
          <Card className={styles.formCard} radius="lg">
            <CardContent className={styles.formContent}>
              <div className={styles.formHeading}>
                <span className={styles.formHeadingIcon}>✦</span>
                <h2 className={styles.formHeadingText}>{t('mentorIntern.performance.newAssessment')}</h2>
              </div>
              <form
                className={styles.form}
                onSubmit={form.handleSubmit(async values => {
                  await createAssessment.mutateAsync({
                    internId,
                    criterionId: values.criterionId,
                    score: Number(values.score),
                    comment: values.comment || undefined,
                  });
                  form.reset({
                    criterionId: values.criterionId,
                    score: selectedCriterion?.maxScore ?? 5,
                    comment: '',
                  });
                })}
              >
                <div className={styles.formRow}>
                  <Controller
                    control={form.control}
                    name="criterionId"
                    render={({ field }) => (
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>{t('mentorIntern.performance.criterion')}</span>
                        <select
                          className={styles.select}
                          value={field.value}
                          onChange={e => {
                            field.onChange(e.target.value);
                            const next = detailQuery.data.criteria.find(c => c.id === e.target.value);
                            form.setValue('score', next?.maxScore ?? 5);
                          }}
                        >
                          {detailQuery.data.criteria.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  />

                  <Controller
                    control={form.control}
                    name="score"
                    render={({ field }) => (
                      <label className={styles.field}>
                        <span className={styles.fieldLabel}>
                          {t('mentorIntern.performance.score')}
                          {selectedCriterion && (
                            <span className={styles.fieldLabelHint}>
                              {t('mentorIntern.performance.max', { count: selectedCriterion.maxScore })}
                            </span>
                          )}
                        </span>
                        <input
                          className={styles.input}
                          max={selectedCriterion?.maxScore ?? 5}
                          min={1}
                          type="number"
                          value={String(field.value ?? '')}
                          onChange={e => field.onChange(Number(e.target.value))}
                        />
                      </label>
                    )}
                  />
                </div>

                {selectedCriterion && (
                  <div className={styles.scorePreview}>
                    <div
                      className={styles.scorePreviewFill}
                      style={{
                        width: `${Math.round((selectedScore / selectedCriterion.maxScore) * 100)}%`,
                      }}
                    />
                    <span className={styles.scorePreviewLabel}>
                      {t('mentorIntern.performance.percentOfMax', {
                        count: Math.round((selectedScore / selectedCriterion.maxScore) * 100),
                      })}
                    </span>
                  </div>
                )}

                <Controller
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <label className={styles.field}>
                      <span className={styles.fieldLabel}>{t('mentorIntern.performance.mentorNotes')}</span>
                      <textarea
                        className={styles.textarea}
                        placeholder={t('mentorIntern.performance.notesPlaceholder')}
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                      />
                    </label>
                  )}
                />

                {createAssessment.error && (
                  <PanelState
                    description={createAssessment.error.message}
                    title={t('mentorIntern.performance.saveErrorTitle')}
                    tone="danger"
                  />
                )}

                <Button
                  className={styles.submitBtn}
                  fullWidth
                  isLoading={createAssessment.isPending}
                  radius="lg"
                  size="lg"
                  type="submit"
                  variant="solid"
                >
                  {createAssessment.isPending
                    ? t('mentorIntern.performance.saving')
                    : t('mentorIntern.performance.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className={styles.historyCard} radius="lg">
            <CardContent className={styles.historyContent}>
              <div className={styles.historyHead}>
                <h3 className={styles.historyHeadTitle}>{t('mentorIntern.performance.historyTitle')}</h3>
                <span className={styles.historyCount}>{assessments.length}</span>
              </div>

              {assessments.length === 0 ? (
                <PanelState
                  description={t('mentorIntern.performance.historyEmptyDescription')}
                  title={t('mentorIntern.performance.historyEmptyTitle')}
                />
              ) : (
                <ul className={styles.historyList}>
                  {assessments.slice(0, 6).map(a => {
                    const tier = scoreTier(a.score, a.criterion.maxScore);
                    return (
                      <li className={styles.historyItem} key={a.id}>
                        <div className={styles.historyItemInner}>
                          <div className={styles.historyItemRow}>
                            <span className={styles.historyItemTitle}>{a.criterion.title}</span>
                            <span className={`${styles.historyScore} ${styles[`historyScore--${tier}`]}`}>
                              {a.score}
                              <span className={styles.historyScoreMax}>/{a.criterion.maxScore}</span>
                            </span>
                          </div>
                          <div className={styles.historyProgressTrack}>
                            <div
                              className={`${styles.historyProgressFill} ${styles[`historyProgressFill--${tier}`]}`}
                              style={{ width: `${Math.round((a.score / a.criterion.maxScore) * 100)}%` }}
                            />
                          </div>
                          <div className={styles.historyMeta}>
                            <time className={styles.historyDate}>
                              {formatDate(a.createdAt, i18n.resolvedLanguage, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </time>
                            <span className={styles.historyMetaDot} />
                            <span className={styles.historyMentor}>{a.mentor.fullName}</span>
                          </div>
                          {a.comment && <blockquote className={styles.historyComment}>{a.comment}</blockquote>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </SectionPanel>
    </main>
  );
}
