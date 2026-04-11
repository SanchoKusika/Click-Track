import { useLeaderboardQuery, useMyAssessmentsQuery } from '@entities/intern';
import { useMySettingsQuery } from '@entities/settings';
import { useCurrentUserQuery } from '@entities/session';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@shared/i18n';
import { Card, CardContent, CardHeader } from '@shared/ui/heroui';
import { MetricCard } from '@shared/ui/metric-card';
import { PageHeader } from '@shared/ui/page-header';

import styles from './styles.module.css';

function RatingStars({ max = 5, rating }: { rating: number; max?: number }) {
  return (
    <div className={styles.starsContainer}>
      {[...Array(max)].map((_, i) => {
        const isFilled = i < Math.round(rating);

        return (
          <svg
            key={i}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isFilled ? '#006FEE' : 'none'}
            stroke={isFilled ? '#006FEE' : '#D4D4D8'}
            strokeWidth="2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
}

export function MePage() {
  const { i18n, t } = useTranslation();
  const { data: user, isLoading: isUserLoading } = useCurrentUserQuery();
  const settingsQuery = useMySettingsQuery();
  const assessments = useMyAssessmentsQuery();
  const leaderboard = useLeaderboardQuery();

  const groupedAssessments = (assessments.data ?? []).reduce<Record<string, NonNullable<typeof assessments.data>>>(
    (acc, item) => {
      const key = item.criterion.title;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);

      return acc;
    },
    {}
  );

  const averageScore = (() => {
    if (!assessments.data?.length) return '0.00';

    return (assessments.data.reduce((sum, item) => sum + item.score, 0) / assessments.data.length).toFixed(2);
  })();

  if (isUserLoading) return <div className={styles.loading}>{t('me.loadingProfile')}</div>;

  return (
    <section className={styles.pageWrapper}>
      <PageHeader
        avatarSrc={settingsQuery.data?.photoUrl ?? null}
        fullName={user?.fullName ?? t('me.fallback.noName')}
        email={user?.email ?? t('me.fallback.noEmail')}
      />

      <div className={styles.metricsGrid}>
        <MetricCard
          className={styles.metricCardCustom}
          hint={t('me.metrics.avgHint')}
          label={t('me.metrics.avgLabel')}
          value={averageScore}
        />
        <MetricCard
          className={styles.metricCardCustom}
          hint={t('me.metrics.reviewsHint')}
          label={t('me.metrics.reviewsLabel')}
          value={assessments.data?.length ?? 0}
        />
        <MetricCard
          className={styles.metricCardCustom}
          hint={t('me.metrics.lastUpdateHint')}
          label={t('me.metrics.lastUpdateLabel')}
          value={
            assessments.data?.[0]?.createdAt
              ? formatDate(assessments.data[0].createdAt, i18n.resolvedLanguage)
              : t('me.fallback.noFeedback')
          }
        />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.contentColumn}>
          {/* Skill Assessment Block */}
          <Card className={styles.skillAssessmentCard} radius="xl" shadow="sm">
            <CardHeader className={styles.cardHeaderFlex}>
              <div className={styles.iconWrapper}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                  <path
                    d="M3 3v18h18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M18 17l-4-4-4 4-4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className={styles.cardTitle}>{t('me.skills.title')}</h2>
            </CardHeader>
            <CardContent className={styles.cardContentNoTop}>
              <div className={styles.skillsGrid}>
                {Object.entries(groupedAssessments).map(([title, items]) => {
                  const latest = items[0];

                  return (
                    <div key={title} className={styles.skillItem}>
                      <div className={styles.skillHeader}>
                        <h3 className={styles.criterionTitle}>{title}</h3>
                        <span className={styles.proficiencyLabel}>
                          {latest.score >= 4 ? t('me.skills.expert') : t('me.skills.active')}
                        </span>
                      </div>
                      <RatingStars rating={latest.score} max={latest.criterion.maxScore} />
                      <p className={styles.assessmentComment}>
                        {latest.comment ? `${latest.comment}` : t('me.skills.defaultComment')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Performance History */}
          <Card className={styles.cardPadding} radius="xl" shadow="sm">
            <CardHeader className={styles.cardHeaderBetween}>
              <h2 className={styles.cardTitle}>{t('me.monthly.title')}</h2>
              <div className={styles.globalRatingBadge}>
                <span className={styles.badgeLabel}>{t('me.monthly.globalRating')}</span>
                <RatingStars rating={Number(averageScore)} />
              </div>
            </CardHeader>
            <CardContent className={styles.cardContentMonthly}>
              <h4 className={styles.mentorNotesTitle}>{t('me.monthly.notesTitle')}</h4>
              <div className={styles.assessmentList}>
                {assessments.data && assessments.data.length > 0 ? (
                  [...assessments.data]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((item, idx) => (
                      <div
                        key={item.id}
                        className={`${styles.monthlyCard} ${idx === 0 ? styles.monthlyCardActive : styles.monthlyCardInactive}`}
                      >
                        <div className={styles.monthlyHeader}>
                          <span className={styles.monthlyDate}>
                            {formatDate(item.createdAt, i18n.resolvedLanguage, { month: 'long', year: 'numeric' })}
                          </span>
                          <div className={styles.monthlyScore}>
                            <span className={styles.scoreLabel}>{t('me.monthly.scoreLabel')}</span>
                            <span className={styles.scoreValue}>{item.score.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className={styles.monthlyComment}>
                          {item.comment ? `${item.comment}` : t('me.monthly.emptyComment')}
                        </p>
                      </div>
                    ))
                ) : (
                  <div className={styles.emptyState}>{t('me.monthly.emptyState')}</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Column */}
        <div className={styles.sidebarColumn}>
          <Card className={styles.leaderboardCard} radius="xl" shadow="sm">
            <CardHeader className={styles.leaderboardHeader}>
              <h2 className={styles.cardTitle}>{t('me.leaderboard.title')}</h2>
              <p className={styles.cardSubtitle}>{t('me.leaderboard.subtitle')}</p>
            </CardHeader>
            <CardContent className="p-0">
              <table className={styles.leaderboardTable}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th className={styles.tableHeaderCell}>{t('me.leaderboard.rank')}</th>
                    <th className={styles.tableHeaderCell}>{t('me.leaderboard.intern')}</th>
                    <th className={styles.tableHeaderCellCenter}>{t('me.leaderboard.reviews')}</th>
                    <th className={styles.tableHeaderCellRight}>{t('me.leaderboard.avgScore')}</th>
                  </tr>
                </thead>
                <tbody className={styles.tableBody}>
                  {(leaderboard.data ?? []).slice(0, 5).map((item, index) => {
                    const isMe = item.userId === user?.id;
                    const score = Number(item.averageScore);
                    const isFirst = index === 0;
                    const isSecond = index === 1;
                    const isThird = index === 2;

                    const rankColor = isFirst ? '#D97706' : isSecond ? '#64748B' : isThird ? '#B45309' : '#94A3B8';
                    const scoreColor = score >= 4.5 ? '#D97706' : score >= 4.0 ? '#10B981' : '#0077FF';

                    // Определяем фон строки через динамический класс
                    const rowClass = isFirst
                      ? styles.rowFirst
                      : isSecond
                        ? styles.rowSecond
                        : isThird
                          ? styles.rowThird
                          : isMe
                            ? styles.rowMe
                            : styles.rowDefault;

                    return (
                      <tr key={item.userId} className={`${styles.tableRow} ${rowClass}`}>
                        <td className={styles.tableCellRelative}>
                          {isMe && <div className={styles.meIndicator} />}
                          <span className={styles.rankText} style={{ color: rankColor }}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.internNameWrapper}>
                            <span className={isMe ? styles.internNameMe : styles.internNameDefault}>
                              {item.fullName.split(' ')[0]}
                            </span>
                            {isMe && <span className={styles.youBadge}>{t('me.leaderboard.you')}</span>}
                          </div>
                        </td>
                        <td className={styles.tableCellCenter}>{item.totalAssessments}</td>
                        <td className={styles.tableCellRight}>
                          <span className={styles.scoreText} style={{ color: scoreColor }}>
                            {item.averageScore}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
