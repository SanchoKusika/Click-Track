import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMentorInternsQuery } from '@entities/mentor';
import { useTranslation } from 'react-i18next';
import { APP_ROUTES } from '@shared/config/routes';
import { resolveApiAssetUrl } from '@shared/api/api-instance';
import { Avatar, Button, Card, CardContent, Chip, Skeleton } from '@shared/ui/heroui';
import { MetricCard } from '@shared/ui/metric-card';
import { PanelState } from '@shared/ui/panel-state';
import { RatingStars } from '@shared/ui/rating-stars';
import { SectionPanel } from '@shared/ui/section-panel';
import { StatRow } from '@shared/ui/stat-row';

import styles from './styles.module.css';

export function DashboardPage() {
  const { t } = useTranslation();
  const internsQuery = useMentorInternsQuery();
  const navigate = useNavigate();
  const interns = internsQuery.data ?? [];
  const { totalReviews, averageScore } = useMemo(() => {
    const total = interns.reduce((sum, item) => sum + item.assessments.length, 0);
    const sumScores = interns.reduce(
      (sum, item) => sum + item.assessments.reduce((inner, assessment) => inner + assessment.score, 0),
      0
    );
    return {
      totalReviews: total,
      averageScore: total ? (sumScores / total).toFixed(2) : '0.00',
    };
  }, [interns]);
  return (
    <section className={styles.pageContainer}>
      <div className={styles.headerCard}>
        <p className={styles.eyebrow}>{t('dashboard.eyebrow')}</p>
        <h2 className={styles.title}>{t('dashboard.title')}</h2>
        <p className={styles.description}>{t('dashboard.description')}</p>
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard
          hint={t('dashboard.metrics.internsHint')}
          label={t('dashboard.metrics.internsLabel')}
          value={interns.length}
        />
        <MetricCard
          hint={t('dashboard.metrics.reviewsHint')}
          label={t('dashboard.metrics.reviewsLabel')}
          value={totalReviews}
        />
        <MetricCard
          hint={t('dashboard.metrics.avgHint')}
          label={t('dashboard.metrics.avgLabel')}
          value={averageScore}
        />
      </div>

      {internsQuery.isLoading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Card className={styles.loadingCard} key={index} radius="lg">
              <CardContent className={styles.loadingCardContent}>
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-5 w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {!internsQuery.isLoading && interns.length === 0 ? (
        <PanelState description={t('dashboard.empty.description')} title={t('dashboard.empty.title')} />
      ) : null}

      {interns.length > 0 ? (
        <SectionPanel subtitle={t('dashboard.roster.subtitle')} title={t('dashboard.roster.title')}>
          <div className={styles.internsGrid}>
            {interns.map(item => {
              const internAverage = item.assessments.length
                ? item.assessments.reduce((sum, assessment) => sum + assessment.score, 0) / item.assessments.length
                : 0;

              return (
                <Card className={styles.internCard} key={item.id} radius="lg">
                  <CardContent className={styles.internCardContent}>
                    <div className={styles.internHeader}>
                      <div className={styles.internIdentity}>
                        <Avatar
                          className="bg-(--primary-soft) text-(--primary)"
                          name={item.user.fullName}
                          size="sm"
                          src={resolveApiAssetUrl(item.user.photoUrl) ?? undefined}
                        />
                        <div className="min-w-0">
                          <div className={styles.internName}>{item.user.fullName}</div>
                          <div className={styles.internEmail}>{item.user.email}</div>
                        </div>
                      </div>
                      <Chip color="accent" radius="full" size="sm" variant="soft">
                        {t('dashboard.roster.reviewsCount', { count: item.assessments.length })}
                      </Chip>
                    </div>

                    <div className={styles.internStats}>
                      <StatRow label={t('dashboard.roster.averageScore')} value={`${internAverage.toFixed(2)} / 5`} />
                      <RatingStars size="sm" value={internAverage} />
                      <StatRow
                        label={t('dashboard.roster.lastCriterion')}
                        value={item.assessments[0]?.criterion.title ?? t('dashboard.roster.noReviewsYet')}
                      />
                    </div>

                    <Button
                      as={Link}
                      className={styles.openButton}
                      onPress={() => navigate(APP_ROUTES.mentorIntern(item.id))}
                      fullWidth
                      radius="lg"
                      to={APP_ROUTES.mentorIntern(item.id)}
                      variant="solid"
                    >
                      {t('dashboard.roster.openCard')}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </SectionPanel>
      ) : null}
    </section>
  );
}
