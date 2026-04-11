import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SETTINGS_UPLOADS_DIR } from './settings-upload.config';
import { SettingsService } from './settings.service';

jest.mock('node:crypto', () => ({
  randomUUID: jest.fn(),
}));

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
}));

const randomUUIDMock = randomUUID as jest.MockedFunction<typeof randomUUID>;
const mkdirMock = mkdir as jest.MockedFunction<typeof mkdir>;
const writeFileMock = writeFile as jest.MockedFunction<typeof writeFile>;
const unlinkMock = unlink as jest.MockedFunction<typeof unlink>;

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(() => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };
    service = new SettingsService(prisma as unknown as PrismaService);

    randomUUIDMock.mockReturnValue('photo-uuid');
    mkdirMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);
    unlinkMock.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns current user settings', async () => {
    const user = {
      id: 'user-1',
      email: 'intern@click.local',
      fullName: 'Intern One',
      role: 'INTERN',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      phone: '+998901234567',
      photoUrl: '/uploads/photo.jpg',
    };
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(service.me('user-1')).resolves.toEqual(user);
  });

  it('throws NotFoundException when user is missing in me()', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.me('missing-user')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('updates phone only', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'intern@click.local',
      fullName: 'Intern One',
      role: 'INTERN',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      phone: null,
      photoUrl: null,
    });
    prisma.user.update.mockResolvedValue({
      id: 'user-1',
      phone: '+998901234567',
      photoUrl: null,
    });

    await service.updateMe('user-1', { phone: '+998901234567' });

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: { phone: '+998901234567' },
      }),
    );
  });

  it('rejects removePhoto=true when photo is provided', async () => {
    await expect(
      service.updateMe(
        'user-1',
        { removePhoto: true },
        {
          originalname: 'new-photo.jpg',
          mimetype: 'image/jpeg',
          size: 10,
          buffer: Buffer.from('a'),
        },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('removes existing photo when removePhoto=true', async () => {
    const existing = {
      id: 'user-1',
      email: 'intern@click.local',
      fullName: 'Intern One',
      role: 'INTERN',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      phone: '+998901234567',
      photoUrl: '/uploads/existing.jpg',
    };
    prisma.user.findUnique.mockResolvedValue(existing);
    prisma.user.update.mockResolvedValue({ ...existing, photoUrl: null });

    await service.updateMe('user-1', { removePhoto: true });

    expect(unlinkMock).toHaveBeenCalledWith(
      join(SETTINGS_UPLOADS_DIR, 'existing.jpg'),
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { photoUrl: null },
      }),
    );
  });

  it('replaces existing photo with new uploaded one', async () => {
    const existing = {
      id: 'user-1',
      email: 'intern@click.local',
      fullName: 'Intern One',
      role: 'INTERN',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      phone: '+998901234567',
      photoUrl: '/uploads/existing.jpg',
    };
    prisma.user.findUnique.mockResolvedValue(existing);
    prisma.user.update.mockResolvedValue({
      ...existing,
      photoUrl: '/uploads/photo-uuid.webp',
    });

    await service.updateMe(
      'user-1',
      {},
      {
        originalname: 'new-photo.webp',
        mimetype: 'image/webp',
        size: 1000,
        buffer: Buffer.from('img'),
      },
    );

    expect(mkdirMock).toHaveBeenCalledWith(SETTINGS_UPLOADS_DIR, {
      recursive: true,
    });
    expect(writeFileMock).toHaveBeenCalledWith(
      join(SETTINGS_UPLOADS_DIR, 'photo-uuid.webp'),
      Buffer.from('img'),
    );
    expect(unlinkMock).toHaveBeenCalledWith(
      join(SETTINGS_UPLOADS_DIR, 'existing.jpg'),
    );
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { photoUrl: '/uploads/photo-uuid.webp' },
      }),
    );
  });

  it('throws NotFoundException when user is missing in update', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.updateMe(
        'missing-user',
        {},
        {
          originalname: 'new-photo.webp',
          mimetype: 'image/webp',
          size: 1000,
          buffer: Buffer.from('img'),
        },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(writeFileMock).not.toHaveBeenCalled();
  });
});
