import { useQuery } from '@tanstack/react-query';
import { internControllerLeaderboard, internControllerMyAssessments } from '@shared/api/generated_api';
import type { InternAssessment, LeaderboardEntry } from './types';

export function useMyAssessmentsQuery() {
  return useQuery({
    queryKey: ['my-assessments'],
    queryFn: async () => (await internControllerMyAssessments()) as InternAssessment[],
  });
}

export function useLeaderboardQuery() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => (await internControllerLeaderboard()) as LeaderboardEntry[],
  });
}
