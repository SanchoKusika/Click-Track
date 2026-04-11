import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import { basename, join } from 'node:path';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import {
  assertValidUploadedPhoto,
  isUploadedSettingsPhoto,
  resolvePhotoExtension,
  SETTINGS_UPLOADS_DIR,
  UploadedSettingsPhoto,
} from './settings-upload.config';

const USER_SETTINGS_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  createdAt: true,
  phone: true,
  photoUrl: true,
} as const;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_SETTINGS_SELECT,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateMe(userId: string, dto: UpdateSettingsDto, photoInput?: unknown) {
    const photo = this.normalizePhotoInput(photoInput);
    if (dto.removePhoto && photo) {
      throw new BadRequestException(
        'removePhoto cannot be true when photo is provided',
      );
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: USER_SETTINGS_SELECT,
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    const updateData: { phone?: string | null; photoUrl?: string | null } = {};

    if (dto.phone !== undefined) {
      updateData.phone = dto.phone;
    }

    if (dto.removePhoto) {
      if (existingUser.photoUrl) {
        await this.removeUploadedFileByUrl(existingUser.photoUrl);
      }
      updateData.photoUrl = null;
    } else if (photo) {
      assertValidUploadedPhoto(photo);
      const photoFileName = await this.persistPhoto(photo);
      if (existingUser.photoUrl) {
        await this.removeUploadedFileByUrl(existingUser.photoUrl);
      }
      updateData.photoUrl = `/uploads/${photoFileName}`;
    }

    if (!Object.keys(updateData).length) {
      return existingUser;
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: USER_SETTINGS_SELECT,
    });
  }

  private async removeUploadedFileByUrl(photoUrl: string) {
    const safeFileName = basename(photoUrl.split('?')[0] ?? '');
    if (!safeFileName || safeFileName === 'uploads') {
      return;
    }

    await this.removeUploadedFile(join(SETTINGS_UPLOADS_DIR, safeFileName));
  }

  private async removeUploadedFile(filePath: string) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  private normalizePhotoInput(
    photoInput: unknown,
  ): UploadedSettingsPhoto | undefined {
    if (photoInput === undefined || photoInput === null) {
      return undefined;
    }

    if (!isUploadedSettingsPhoto(photoInput)) {
      throw new BadRequestException('Invalid photo payload');
    }

    return photoInput;
  }

  private async persistPhoto(photo: UploadedSettingsPhoto): Promise<string> {
    await fs.mkdir(SETTINGS_UPLOADS_DIR, { recursive: true });
    const extension = resolvePhotoExtension(photo);
    const fileName = `${randomUUID()}${extension}`;
    const filePath = join(SETTINGS_UPLOADS_DIR, fileName);

    await fs.writeFile(filePath, photo.buffer);
    return fileName;
  }
}
