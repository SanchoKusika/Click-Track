import { type MentorAllInternListItem, useAllInternsQuery, useAssignInternMutation } from '@/entities/mentor';
import { useCurrentUser } from '@entities/session';
import { useTranslation } from 'react-i18next';
import { resolveApiAssetUrl } from '@shared/api/api-instance';
import { Avatar, Button, Card, CardContent, Chip, Skeleton, toast } from '@shared/ui/heroui';
import { MetricCard } from '@shared/ui/metric-card';
import { PanelState } from '@shared/ui/panel-state';
import { RatingStars } from '@shared/ui/rating-stars';
import { SectionPanel } from '@shared/ui/section-panel';
import { StatRow } from '@shared/ui/stat-row';
import React from 'react';

import styles from './styles.module.css';

const ListAllInternsPage: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = useCurrentUser();
  const currentMentorId = currentUser?.role === 'MENTOR' ? currentUser.id : null;
  const { data: interns, isLoading, isError } = useAllInternsQuery();
  const [addingId, setAddingId] = React.useState<string | null>(null);
  const assignMutation = useAssignInternMutation();

  const handleAddIntern = (internId: string): void => {
    setAddingId(internId);
    assignMutation.mutate(internId, {
      onSuccess: () => {
        toast.success(t('allInterns.toasts.addedTitle'), { description: t('allInterns.toasts.addedDescription') });
      },
      onError: () => {
        toast.danger(t('allInterns.toasts.errorTitle'), { description: t('allInterns.toasts.errorDescription') });
      },
      onSettled: () => setAddingId(null),
    });
  };

  const allInterns = interns?.items ?? [];
  const withProfile = allInterns.filter((i: MentorAllInternListItem) => i.internProfile !== null);
  const withoutProfile = allInterns.filter((i: MentorAllInternListItem) => i.internProfile === null);
  const totalAssessments = withProfile.reduce(
    (sum: number, i: MentorAllInternListItem) => sum + (i.internProfile?.assessments.length ?? 0),
    0
  );

  if (isError)
    return <PanelState description={t('allInterns.error.description')} title={t('allInterns.error.title')} />;

  return (
    <section className={styles.pageContainer}>
      <div className={styles.headerCard}>
        <p className={styles.eyebrow}>{t('allInterns.header.eyebrow')}</p>
        <h2 className={styles.title}>{t('allInterns.header.title')}</h2>
        <p className={styles.description}>{t('allInterns.header.description')}</p>
      </div>

      <div className={styles.metricsGrid}>
        <MetricCard
          hint={t('allInterns.metrics.totalHint')}
          label={t('allInterns.metrics.totalLabel')}
          value={allInterns.length}
        />
        <MetricCard
          hint={t('allInterns.metrics.withProfileHint')}
          label={t('allInterns.metrics.withProfileLabel')}
          value={withProfile.length}
        />
        <MetricCard
          hint={t('allInterns.metrics.withoutProfileHint')}
          label={t('allInterns.metrics.withoutProfileLabel')}
          value={withoutProfile.length}
        />
        <MetricCard
          hint={t('allInterns.metrics.assessmentsHint')}
          label={t('allInterns.metrics.assessmentsLabel')}
          value={totalAssessments}
        />
      </div>

      {isLoading ? (
        <div className={styles.loadingGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Card className={styles.loadingCard} key={index} radius="lg">
              <CardContent className={styles.loadingCardContent}>
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-5 w-1/2 rounded-lg" />
                <Skeleton className="h-4 w-3/4 rounded-lg" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {!isLoading && allInterns.length === 0 ? (
        <PanelState description={t('allInterns.empty.description')} title={t('allInterns.empty.title')} />
      ) : null}

      {allInterns.length > 0 ? (
        <SectionPanel subtitle={t('allInterns.list.subtitle')} title={t('allInterns.list.title')}>
          <div className={styles.internsGrid}>
            {allInterns.map((intern: MentorAllInternListItem) => {
              const assessments = intern.internProfile?.assessments ?? [];
              const avgScore = assessments.length
                ? assessments.reduce((sum: number, a) => sum + a.score, 0) / assessments.length
                : 0;
              const hasProfile = intern.internProfile !== null;
              const assignedMentorId = intern.internProfile?.mentorId ?? null;
              const isAssignedToCurrentMentor = Boolean(currentMentorId && assignedMentorId === currentMentorId);
              const isUnassigned = assignedMentorId === null;
              const ctaLabel = isUnassigned
                ? t('allInterns.list.ctaUnassigned')
                : isAssignedToCurrentMentor
                  ? t('allInterns.list.ctaAssignedYou')
                  : t('allInterns.list.ctaAssignedOther');
              const isActionDisabled = !isUnassigned;

              return (
                <Card className={styles.internCard} key={intern.id} radius="lg">
                  <CardContent className={styles.internCardContent}>
                    <div className={styles.internHeader}>
                      <div className={styles.internIdentity}>
                        <Avatar
                          className="bg-(--primary-soft) text-(--primary)"
                          name={intern.fullName}
                          size="sm"
                          src={resolveApiAssetUrl(intern.photoUrl) ?? undefined}
                        />
                        <div className="min-w-0">
                          <div className={styles.internName}>{intern.fullName}</div>
                          <div className={styles.internEmail}>{intern.email}</div>
                        </div>
                      </div>
                      <Chip color={hasProfile ? 'accent' : 'default'} radius="full" size="sm" variant="soft">
                        {hasProfile
                          ? t('allInterns.list.reviewsCount', { count: assessments.length })
                          : t('allInterns.list.noProfile')}
                      </Chip>
                    </div>

                    {hasProfile ? (
                      <div className={styles.internStats}>
                        <StatRow label={t('allInterns.list.averageScore')} value={`${avgScore.toFixed(2)} / 5`} />
                        <RatingStars size="sm" value={avgScore} />
                        <StatRow
                          label={t('allInterns.list.lastCriterion')}
                          value={assessments[0]?.criterion?.title ?? t('allInterns.list.noReviewsYet')}
                        />
                      </div>
                    ) : (
                      <div className={styles.noProfileBadge}>
                        <span className={styles.noProfileText}>{t('allInterns.list.profileNotAssigned')}</span>
                      </div>
                    )}

                    <Button
                      className={styles.openButton}
                      fullWidth
                      radius="lg"
                      variant="solid"
                      isDisabled={isActionDisabled}
                      isLoading={addingId === intern.id}
                      onPress={() => {
                        if (isUnassigned) {
                          handleAddIntern(intern.id);
                        }
                      }}
                    >
                      {ctaLabel}
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
};

export default ListAllInternsPage;
