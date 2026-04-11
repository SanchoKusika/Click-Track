import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InternService {
  constructor(private readonly prisma: PrismaService) {}

  async myAssessments(userId: string) {
    const profile = await this.prisma.internProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      return [];
    }
    return this.prisma.assessment.findMany({
      where: { internId: profile.id },
      include: {
        criterion: true,
        mentor: { select: { id: true, fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  leaderboard() {
    return this.prisma.internProfile
      .findMany({
        include: {
          user: { select: { id: true, fullName: true } },
          assessments: true,
        },
      })
      .then((profiles) =>
        profiles
          .map((p) => {
            const total = p.assessments.reduce(
              (sum, item) => sum + item.score,
              0,
            );
            const avg = p.assessments.length ? total / p.assessments.length : 0;
            return {
              internId: p.id,
              userId: p.user.id,
              fullName: p.user.fullName,
              averageScore: Number(avg.toFixed(2)),
              totalAssessments: p.assessments.length,
            };
          })
          .sort((a, b) => b.averageScore - a.averageScore),
      );
  }
}
