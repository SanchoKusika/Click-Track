import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const E164_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

function normalizePhone(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    return value as string;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'null') {
    return null;
  }

  return trimmed;
}

function normalizeBoolean(value: unknown): boolean | string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value !== 'string') {
    return 'invalid_boolean';
  }

  const normalized = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return String(value);
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({
    example: '+998901234567',
    nullable: true,
    description:
      'Phone in E.164 format. Send empty string or "null" to clear value.',
  })
  @Transform(({ value }) => normalizePhone(value))
  @IsOptional()
  @Matches(E164_PHONE_PATTERN, { message: 'phone must be in E.164 format' })
  phone?: string | null;

  @ApiPropertyOptional({
    example: false,
    description:
      'Set true to remove current photo. Cannot be combined with photo file in same request.',
  })
  @Transform(({ value }) => normalizeBoolean(value))
  @IsOptional()
  @IsBoolean()
  removePhoto?: boolean;
}

export class UpdateSettingsMultipartDto extends UpdateSettingsDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Profile photo. Supported formats: JPEG, PNG, WebP. Max size: 5MB.',
  })
  photo?: unknown;
}
