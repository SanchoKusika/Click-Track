import { BadRequestException } from '@nestjs/common';
import { extname, join } from 'node:path';

export const SETTINGS_UPLOADS_DIR = join(process.cwd(), 'uploads');
export const SETTINGS_PHOTO_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const SETTINGS_PHOTO_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export type UploadedSettingsPhoto = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

export function isUploadedSettingsPhoto(
  value: unknown,
): value is UploadedSettingsPhoto {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<UploadedSettingsPhoto>;
  return (
    typeof candidate.originalname === 'string' &&
    typeof candidate.mimetype === 'string' &&
    typeof candidate.size === 'number' &&
    Buffer.isBuffer(candidate.buffer)
  );
}

export function extensionFromMimeType(mimeType: string): string {
  if (mimeType === 'image/jpeg') {
    return '.jpg';
  }
  if (mimeType === 'image/png') {
    return '.png';
  }
  if (mimeType === 'image/webp') {
    return '.webp';
  }
  return '';
}

export function assertValidUploadedPhoto(photo: UploadedSettingsPhoto) {
  if (!SETTINGS_PHOTO_ALLOWED_MIME_TYPES.has(photo.mimetype)) {
    throw new BadRequestException('photo must be a JPEG, PNG, or WebP image');
  }

  if (photo.size > SETTINGS_PHOTO_MAX_SIZE_BYTES) {
    throw new BadRequestException(
      `photo file size must not exceed ${Math.floor(SETTINGS_PHOTO_MAX_SIZE_BYTES / (1024 * 1024))}MB`,
    );
  }
}

export function resolvePhotoExtension(photo: UploadedSettingsPhoto): string {
  const byOriginalName = extname(photo.originalname).toLowerCase();
  if (byOriginalName) {
    return byOriginalName;
  }

  const byMimeType = extensionFromMimeType(photo.mimetype);
  if (byMimeType) {
    return byMimeType;
  }

  throw new BadRequestException('photo extension could not be resolved');
}
