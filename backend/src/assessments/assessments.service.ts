import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';

@Injectable()
export class AssessmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createByMentor(mentorId: string, dto: CreateAssessmentDto) {
    const internProfile = await this.prisma.internProfile.findUnique({
      where: { id: dto.internId },
    });
    if (!internProfile || internProfile.mentorId !== mentorId) {
      throw new ForbiddenException('You can assess only your assigned interns');
    }

    return this.prisma.assessment.create({
      data: {
        internId: dto.internId,
        mentorId,
        criterionId: dto.criterionId,
        score: dto.score,
        comment: dto.comment,
      },
    });
  }

  listMentorInterns(mentorId: string) {
    return this.prisma.internProfile.findMany({
      where: { mentorId },
      include: {
        user: { select: { id: true, fullName: true, email: true, photoUrl: true } },
        assessments: {
          include: {
            criterion: true,
            mentor: { select: { id: true, fullName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { user: { fullName: 'asc' } },
    });
  }

  async mentorInternDetail(mentorId: string, internId: string) {
    const intern = await this.prisma.internProfile.findUnique({
      where: { id: internId },
      include: {
        user: { select: { id: true, fullName: true, email: true, photoUrl: true } },
      },
    });

    if (!intern || intern.mentorId !== mentorId) {
      throw new ForbiddenException('You can view only your assigned interns');
    }

    const [criteria, assessments] = await Promise.all([
      this.prisma.criterion.findMany({ orderBy: { title: 'asc' } }),
      this.prisma.assessment.findMany({
        where: { internId },
        include: {
          criterion: true,
          mentor: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      intern,
      criteria,
      assessments,
    };
  }

  listAllInterns() {
    return this.prisma.user.findMany({
      where: { role: Role.INTERN },
      select: {
        id: true,
        fullName: true,
        email: true,
        photoUrl: true,
        internProfile: {
          include: {
            mentor: { select: { id: true, fullName: true, email: true } },
            assessments: {
              include: {
                criterion: true,
                mentor: { select: { id: true, fullName: true } },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });
  }

  async assignIntern(mentorId: string, internId: string) {
    const intern = await this.prisma.user.findUnique({
      where: { id: internId },
      select: {
        id: true,
        role: true,
        internProfile: {
          select: {
            id: true,
            mentorId: true,
          },
        },
      },
    });

    if (!intern) {
      throw new NotFoundException('Intern user not found');
    }

    if (intern.role !== Role.INTERN) {
      throw new BadRequestException(
        'Only users with INTERN role can be assigned',
      );
    }

    const profile = intern.internProfile;

    if (!profile) {
      await this.prisma.internProfile.create({
        data: { userId: internId, mentorId },
      });
    } else if (profile.mentorId !== mentorId) {
      if (profile.mentorId) {
        throw new ForbiddenException(
          'Intern is already assigned to another mentor',
        );
      }
      await this.prisma.internProfile.update({
        where: { id: profile.id },
        data: { mentorId },
      });
    }

    return this.prisma.user.findUniqueOrThrow({
      where: { id: internId },
      select: {
        id: true,
        fullName: true,
        email: true,
        internProfile: {
          include: {
            mentor: { select: { id: true, fullName: true, email: true } },
            assessments: {
              include: {
                criterion: true,
                mentor: { select: { id: true, fullName: true } },
              },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });
  }
}
