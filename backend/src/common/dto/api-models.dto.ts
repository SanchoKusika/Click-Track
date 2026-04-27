import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, SurveyTarget } from '@prisma/client';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from './pagination.dto';

class PaginationMetaDto {
  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: DEFAULT_PAGE })
  page!: number;

  @ApiProperty({ example: DEFAULT_PAGE_SIZE })
  pageSize!: number;
}

export class ApiErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Bad Request' })
  error!: string;

  @ApiProperty({
    oneOf: [
      { type: 'string', example: 'mentorId is required for interns' },
      {
        type: 'array',
        items: { type: 'string' },
        example: [
          'email must be an email',
          'password must be longer than or equal to 6 characters',
        ],
      },
    ],
  })
  message!: string | string[];
}

export class PublicUserDto {
  @ApiProperty({ example: '4be09f38-075b-445d-9f1c-0e6ec9eb4086' })
  id!: string;

  @ApiProperty({ example: 'admin@click.local' })
  email!: string;

  @ApiProperty({ example: 'System Admin' })
  fullName!: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role!: Role;

  @ApiProperty({ example: '2026-04-02T11:04:44.276Z' })
  createdAt!: Date;
}

export class UserBriefDto {
  @ApiProperty({ example: '81c14d5d-8593-4453-8ea9-0198b0f01a02' })
  id!: string;

  @ApiProperty({ example: 'Intern One' })
  fullName!: string;

  @ApiProperty({ example: 'intern1@click.local' })
  email!: string;

  @ApiPropertyOptional({ example: '/uploads/abc.webp', nullable: true })
  photoUrl?: string | null;
}

export class MentorBriefDto {
  @ApiProperty({ example: 'e9009939-2af2-44aa-9f64-1a2ee926e146' })
  id!: string;

  @ApiProperty({ example: 'Mentor One' })
  fullName!: string;

  @ApiPropertyOptional({ example: 'mentor1@click.local' })
  email?: string;
}

export class InternProfileMetaDto {
  @ApiProperty({ example: '148a10d9-885c-43e2-beb2-12b41cbdf367' })
  id!: string;

  @ApiProperty({ example: 'e9009939-2af2-44aa-9f64-1a2ee926e146' })
  mentorId!: string;

  @ApiPropertyOptional({ type: () => MentorBriefDto, nullable: true })
  mentor?: MentorBriefDto | null;
}

export class AdminUserDto extends PublicUserDto {
  @ApiPropertyOptional({ type: () => InternProfileMetaDto, nullable: true })
  internProfile?: InternProfileMetaDto | null;
}

export class CriterionResponseDto {
  @ApiProperty({ example: 'criterion-react' })
  id!: string;

  @ApiProperty({ example: 'React Knowledge' })
  title!: string;

  @ApiProperty({ example: 'Component architecture and hooks' })
  description!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  maxScore!: number;
}

export class AssessmentMentorDto {
  @ApiProperty({ example: 'e9009939-2af2-44aa-9f64-1a2ee926e146' })
  id!: string;

  @ApiProperty({ example: 'Mentor One' })
  fullName!: string;
}

export class AssessmentResponseDto {
  @ApiProperty({ example: '0b1b3c25-ff2a-4995-b3c5-45c9db43961b' })
  id!: string;

  @ApiProperty({ example: '148a10d9-885c-43e2-beb2-12b41cbdf367' })
  internId!: string;

  @ApiProperty({ example: 'e9009939-2af2-44aa-9f64-1a2ee926e146' })
  mentorId!: string;

  @ApiProperty({ example: 'criterion-react' })
  criterionId!: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  score!: number;

  @ApiPropertyOptional({
    type: String,
    example: 'Initial review for Intern One',
    nullable: true,
  })
  comment?: string | null;

  @ApiProperty({ example: '2026-04-02T11:04:44.560Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ type: () => CriterionResponseDto })
  criterion?: CriterionResponseDto;

  @ApiPropertyOptional({ type: () => AssessmentMentorDto })
  mentor?: AssessmentMentorDto;
}

export class MentorInternDto {
  @ApiProperty({ example: '148a10d9-885c-43e2-beb2-12b41cbdf367' })
  id!: string;

  @ApiProperty({ example: '81c14d5d-8593-4453-8ea9-0198b0f01a02' })
  userId!: string;

  @ApiProperty({ example: 'e9009939-2af2-44aa-9f64-1a2ee926e146' })
  mentorId!: string;

  @ApiProperty({ type: () => UserBriefDto })
  user!: UserBriefDto;
}

export class MentorInternListItemDto extends MentorInternDto {
  @ApiProperty({ type: () => [AssessmentResponseDto] })
  assessments!: AssessmentResponseDto[];
}

export class MentorInternProfileWithAssessmentsDto {
  @ApiProperty({ example: '148a10d9-885c-43e2-beb2-12b41cbdf367' })
  id!: string;

  @ApiProperty({
    type: String,
    example: 'e9009939-2af2-44aa-9f64-1a2ee926e146',
    nullable: true,
  })
  mentorId?: string;

  @ApiPropertyOptional({ type: () => MentorBriefDto, nullable: true })
  mentor?: MentorBriefDto | null;

  @ApiProperty({ type: () => [AssessmentResponseDto] })
  assessments!: AssessmentResponseDto[];
}

export class MentorAllInternListItemDto {
  @ApiProperty({ example: '81c14d5d-8593-4453-8ea9-0198b0f01a02' })
  id!: string;

  @ApiProperty({ example: 'Intern One' })
  fullName!: string;

  @ApiProperty({ example: 'intern1@click.local' })
  email!: string;

  @ApiPropertyOptional({ example: '/uploads/abc.webp', nullable: true })
  photoUrl?: string | null;

  @ApiProperty({
    type: () => MentorInternProfileWithAssessmentsDto,
    nullable: true,
  })
  internProfile!: MentorInternProfileWithAssessmentsDto | null;
}

export class MentorInternDetailDto {
  @ApiProperty({ type: () => MentorInternDto })
  intern!: MentorInternDto;

  @ApiProperty({ type: () => [CriterionResponseDto] })
  criteria!: CriterionResponseDto[];

  @ApiProperty({ type: () => [AssessmentResponseDto] })
  assessments!: AssessmentResponseDto[];
}

export class LeaderboardEntryDto {
  @ApiProperty({ example: '148a10d9-885c-43e2-beb2-12b41cbdf367' })
  internId!: string;

  @ApiProperty({ example: '81c14d5d-8593-4453-8ea9-0198b0f01a02' })
  userId!: string;

  @ApiProperty({ example: 'Intern One' })
  fullName!: string;

  @ApiProperty({ example: 4 })
  averageScore!: number;

  @ApiProperty({ example: 1 })
  totalAssessments!: number;
}

export class AuthTokensResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty({ type: () => PublicUserDto })
  user!: PublicUserDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;
}

export class SurveyQuestionDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Communication Skills' })
  title!: string;

  @ApiProperty({ example: 0 })
  order!: number;
}

export class SurveyListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Q2 Mentor Review' })
  title!: string;

  @ApiProperty({ enum: SurveyTarget })
  target!: SurveyTarget;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ example: 3 })
  questionCount!: number;

  @ApiProperty({ example: 7 })
  responseCount!: number;
}

export class MySurveyDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Q2 Mentor Review' })
  title!: string;

  @ApiProperty({ enum: SurveyTarget })
  target!: SurveyTarget;

  @ApiProperty({ type: [SurveyQuestionDto] })
  questions!: SurveyQuestionDto[];

  @ApiProperty({ example: false })
  isCompleted!: boolean;

  @ApiProperty()
  createdAt!: Date;
}

export class SurveyAnswerViewDto {
  @ApiProperty()
  questionId!: string;

  @ApiProperty({ example: 'Communication Skills' })
  questionTitle!: string;

  @ApiPropertyOptional({ example: 4, nullable: true })
  score?: number | null;

  @ApiPropertyOptional({ example: 'Very clear communicator', nullable: true })
  comment?: string | null;
}

export class SurveyRespondentDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'Mentor One' })
  fullName!: string;

  @ApiProperty({ example: 'mentor1@click.local' })
  email!: string;
}

export class SurveyResponseViewDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ type: () => SurveyRespondentDto })
  respondent!: SurveyRespondentDto;

  @ApiPropertyOptional({ example: 'My mentor is very helpful', nullable: true })
  comment?: string | null;

  @ApiPropertyOptional({ example: 'Mentor One', nullable: true })
  mentorName?: string | null;

  @ApiProperty({ type: [SurveyAnswerViewDto] })
  answers!: SurveyAnswerViewDto[];

  @ApiProperty()
  createdAt!: Date;
}

export class PaginatedAdminUsersDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [AdminUserDto] })
  items!: AdminUserDto[];
}

export class PaginatedMentorAllInternsDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [MentorAllInternListItemDto] })
  items!: MentorAllInternListItemDto[];
}

export class PaginatedSurveyResponsesDto extends PaginationMetaDto {
  @ApiProperty({ type: () => [SurveyResponseViewDto] })
  items!: SurveyResponseViewDto[];
}
