import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findPublicById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });
  }

  listAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        internProfile: {
          select: {
            id: true,
            mentorId: true,
            mentor: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });
  }

  listMentors() {
    return this.prisma.user.findMany({
      where: { role: Role.MENTOR },
      orderBy: { fullName: 'asc' },
      select: { id: true, email: true, fullName: true },
    });
  }

  async create(payload: {
    email: string;
    fullName: string;
    role: Role;
    password: string;
    mentorId?: string;
  }) {
    if (payload.role === Role.INTERN && !payload.mentorId) {
      throw new BadRequestException('mentorId is required for interns');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: payload.email,
          fullName: payload.fullName,
          role: payload.role,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
      });

      if (payload.role === Role.INTERN && payload.mentorId) {
        await tx.internProfile.create({
          data: { userId: user.id, mentorId: payload.mentorId },
        });
      }
      return user;
    });
  }

  async update(
    id: string,
    payload: { fullName?: string; role?: Role; mentorId?: string },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { id },
        include: { internProfile: true },
      });

      if (!existing) {
        throw new NotFoundException('User not found');
      }

      const nextRole = payload.role ?? existing.role;

      if (
        nextRole === Role.INTERN &&
        !(payload.mentorId ?? existing.internProfile?.mentorId)
      ) {
        throw new BadRequestException('mentorId is required for interns');
      }

      const user = await tx.user.update({
        where: { id },
        data: { fullName: payload.fullName, role: payload.role },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
      });

      if (nextRole === Role.INTERN) {
        await tx.internProfile.upsert({
          where: { userId: id },
          update: {
            mentorId:
              payload.mentorId ?? existing.internProfile?.mentorId ?? '',
          },
          create: { userId: id, mentorId: payload.mentorId ?? '' },
        });
      } else if (existing.internProfile) {
        await tx.assessment.deleteMany({
          where: { internId: existing.internProfile.id },
        });
        await tx.internProfile.delete({ where: { userId: id } });
      }
      return user;
    });
  }

  delete(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({
        where: { id },
        include: { internProfile: true },
      });

      if (!existing) {
        throw new NotFoundException('User not found');
      }

      if (existing.internProfile) {
        await tx.assessment.deleteMany({
          where: { internId: existing.internProfile.id },
        });
        await tx.internProfile.delete({ where: { userId: id } });
      }

      await tx.assessment.deleteMany({ where: { mentorId: id } });
      return tx.user.delete({
        where: { id },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          createdAt: true,
        },
      });
    });
  }
}
