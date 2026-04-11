import type {
  AssessmentResponseDto,
  CreateAssessmentDto,
  MentorAllInternListItemDto,
  MentorInternDetailDto,
  MentorInternListItemDto,
} from '@shared/api/generated_api';

export type Criterion = NonNullable<AssessmentResponseDto['criterion']>;
export type AssessmentRecord = AssessmentResponseDto & {
  criterion: NonNullable<AssessmentResponseDto['criterion']>;
  mentor: NonNullable<AssessmentResponseDto['mentor']>;
};

export type MentorInternListItem = {
  id: MentorInternListItemDto['id'];
  user: MentorInternListItemDto['user'];
  assessments: AssessmentRecord[];
};

export type MentorInternDetail = {
  intern: MentorInternDetailDto['intern'] & {
    user: MentorInternDetailDto['intern']['user'];
  };
  criteria: MentorInternDetailDto['criteria'];
  assessments: AssessmentRecord[];
};

export type MentorAllInternListItem = MentorAllInternListItemDto & {
  internProfile:
    | (NonNullable<MentorAllInternListItemDto['internProfile']> & {
        assessments: AssessmentRecord[];
      })
    | null;
};

export type CreateAssessmentPayload = CreateAssessmentDto;
