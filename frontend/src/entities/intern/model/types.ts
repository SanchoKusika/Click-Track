import type { AssessmentResponseDto, LeaderboardEntryDto } from '@shared/api/generated_api';

export type InternAssessment = AssessmentResponseDto & {
  criterion: NonNullable<AssessmentResponseDto['criterion']>;
  mentor: NonNullable<AssessmentResponseDto['mentor']>;
};

export type LeaderboardEntry = LeaderboardEntryDto;
