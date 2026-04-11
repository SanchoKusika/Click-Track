import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { AssessmentsService } from './assessments.service';

describe('AssessmentsService', () => {
  let service: AssessmentsService;
  let prisma: {
    user: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
    internProfile: {
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      internProfile: {
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new AssessmentsService(prisma as unknown as PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses Role.INTERN filter in listAllInterns()', async () => {
    prisma.user.findMany.mockResolvedValue([]);

    await service.listAllInterns();

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { role: Role.INTERN },
      }),
    );
  });

  it('creates intern profile when assignIntern() is called for an unassigned intern', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'intern-1',
      role: Role.INTERN,
      internProfile: null,
    });
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'intern-1',
      fullName: 'Intern One',
      email: 'intern1@click.local',
      internProfile: {
        id: 'profile-1',
        mentorId: 'mentor-1',
        mentor: {
          id: 'mentor-1',
          fullName: 'Mentor One',
          email: 'm@click.local',
        },
        assessments: [],
      },
    });

    await service.assignIntern('mentor-1', 'intern-1');

    expect(prisma.internProfile.create).toHaveBeenCalledWith({
      data: { userId: 'intern-1', mentorId: 'mentor-1' },
    });
    expect(prisma.internProfile.update).not.toHaveBeenCalled();
  });

  it('returns success without update for idempotent assignment to the same mentor', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'intern-1',
      role: Role.INTERN,
      internProfile: { id: 'profile-1', mentorId: 'mentor-1' },
    });
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      id: 'intern-1',
      fullName: 'Intern One',
      email: 'intern1@click.local',
      internProfile: {
        id: 'profile-1',
        mentorId: 'mentor-1',
        mentor: {
          id: 'mentor-1',
          fullName: 'Mentor One',
          email: 'm@click.local',
        },
        assessments: [],
      },
    });

    await service.assignIntern('mentor-1', 'intern-1');

    expect(prisma.internProfile.create).not.toHaveBeenCalled();
    expect(prisma.internProfile.update).not.toHaveBeenCalled();
  });

  it('throws ForbiddenException when intern is assigned to another mentor', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'intern-1',
      role: Role.INTERN,
      internProfile: { id: 'profile-1', mentorId: 'mentor-2' },
    });

    await expect(
      service.assignIntern('mentor-1', 'intern-1'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.internProfile.update).not.toHaveBeenCalled();
  });

  it('throws BadRequestException when user is not an intern', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'admin-1',
      role: Role.ADMIN,
      internProfile: null,
    });

    await expect(
      service.assignIntern('mentor-1', 'admin-1'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when intern user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.assignIntern('mentor-1', 'missing'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
