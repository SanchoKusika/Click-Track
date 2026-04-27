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

  async leaderboard() {
    const [profiles, aggregates] = await Promise.all([
      this.prisma.internProfile.findMany({
        select: {
          id: true,
          user: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.assessment.groupBy({
        by: ['internId'],
        _avg: { score: true },
        _count: { _all: true },
      }),
    ]);

    const stats = new Map(
      aggregates.map((row) => [
        row.internId,
        {
          avg: row._avg.score ?? 0,
          count: row._count._all,
        },
      ]),
    );

    return profiles
      .map((p) => {
        const s = stats.get(p.id);
        return {
          internId: p.id,
          userId: p.user.id,
          fullName: p.user.fullName,
          averageScore: Number((s?.avg ?? 0).toFixed(2)),
          totalAssessments: s?.count ?? 0,
        };
      })
      .sort((a, b) => b.averageScore - a.averageScore);
  }
}
