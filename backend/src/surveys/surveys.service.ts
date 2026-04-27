import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { SubmitSurveyResponseDto } from './dto/submit-survey-response.dto';
import {
  PaginationQueryDto,
  resolvePagination,
} from '../common/dto/pagination.dto';

@Injectable()
export class SurveysService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSurveyDto) {
    return this.prisma.survey.create({
      data: {
        title: dto.title,
        target: dto.target,
        questions: {
          create:
            dto.questions?.map((q) => ({
              title: q.title,
              order: q.order,
            })) ?? [],
        },
      },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { questions: true, responses: true } },
      },
    });
  }

  async listAll() {
    const surveys = await this.prisma.survey.findMany({
      include: {
        _count: { select: { questions: true, responses: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return surveys.map((s) => ({
      id: s.id,
      title: s.title,
      target: s.target,
      createdAt: s.createdAt,
      questionCount: s._count.questions,
      responseCount: s._count.responses,
    }));
  }

  async delete(id: string) {
    const survey = await this.prisma.survey.findUnique({ where: { id } });
    if (!survey) throw new NotFoundException('Survey not found');

    await this.prisma.surveyAnswer.deleteMany({
      where: { response: { surveyId: id } },
    });
    await this.prisma.surveyResponse.deleteMany({ where: { surveyId: id } });
    await this.prisma.survey.delete({ where: { id } });

    return { success: true };
  }

  async getResponses(surveyId: string, query: PaginationQueryDto = {}) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
    });
    if (!survey) throw new NotFoundException('Survey not found');

    const { page, pageSize, skip, take } = resolvePagination(query);
    const [responses, total] = await this.prisma.$transaction([
      this.prisma.surveyResponse.findMany({
        where: { surveyId },
        skip,
        take,
        include: {
          respondent: {
            include: {
              internProfile: { include: { mentor: true } },
            },
          },
          answers: { include: { question: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.surveyResponse.count({ where: { surveyId } }),
    ]);

    const items = responses.map((r) => ({
      id: r.id,
      respondent: {
        id: r.respondent.id,
        fullName: r.respondent.fullName,
        email: r.respondent.email,
      },
      comment: r.comment,
      mentorName: r.respondent.internProfile?.mentor?.fullName ?? null,
      answers: r.answers.map((a) => ({
        questionId: a.questionId,
        questionTitle: a.question.title,
        score: a.score,
        comment: a.comment,
      })),
      createdAt: r.createdAt,
    }));

    return { items, total, page, pageSize };
  }

  async getMySurveys(userId: string, role: Role) {
    const target = role === Role.MENTOR ? 'MENTOR' : 'INTERN';

    const surveys = await this.prisma.survey.findMany({
      where: { target },
      include: {
        questions: { orderBy: { order: 'asc' } },
        responses: { where: { respondentId: userId } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return surveys.map((s) => ({
      id: s.id,
      title: s.title,
      target: s.target,
      questions: s.questions.map((q) => ({
        id: q.id,
        title: q.title,
        order: q.order,
      })),
      isCompleted: s.responses.length > 0,
      createdAt: s.createdAt,
    }));
  }

  async respond(
    surveyId: string,
    userId: string,
    dto: SubmitSurveyResponseDto,
  ) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
    });
    if (!survey) throw new NotFoundException('Survey not found');

    const existing = await this.prisma.surveyResponse.findUnique({
      where: { surveyId_respondentId: { surveyId, respondentId: userId } },
    });
    if (existing)
      throw new ConflictException('Already responded to this survey');

    return this.prisma.surveyResponse.create({
      data: {
        surveyId,
        respondentId: userId,
        comment: dto.comment,
        answers: {
          create:
            dto.answers?.map((a) => ({
              questionId: a.questionId,
              score: a.score,
              comment: a.comment,
            })) ?? [],
        },
      },
    });
  }
}
