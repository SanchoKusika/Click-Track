import {
  assertValidUploadedPhoto,
  isUploadedSettingsPhoto,
  resolvePhotoExtension,
  SETTINGS_PHOTO_ALLOWED_MIME_TYPES,
  SETTINGS_PHOTO_MAX_SIZE_BYTES,
} from './settings-upload.config';

describe('settings upload config', () => {
  it('validates photo mime type', () => {
    expect(() =>
      assertValidUploadedPhoto({
        originalname: 'avatar.gif',
        mimetype: 'image/gif',
        size: 123,
        buffer: Buffer.from('a'),
      }),
    ).toThrow('photo must be a JPEG, PNG, or WebP image');
  });

  it('validates photo max size', () => {
    expect(() =>
      assertValidUploadedPhoto({
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
        size: SETTINGS_PHOTO_MAX_SIZE_BYTES + 1,
        buffer: Buffer.from('a'),
      }),
    ).toThrow('photo file size must not exceed 5MB');
  });

  it('detects uploaded photo shape', () => {
    expect(
      isUploadedSettingsPhoto({
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
        size: 100,
        buffer: Buffer.from('a'),
      }),
    ).toBe(true);
    expect(isUploadedSettingsPhoto({})).toBe(false);
  });

  it('resolves extension by originalname or mime type', () => {
    expect(
      resolvePhotoExtension({
        originalname: 'avatar.png',
        mimetype: 'image/webp',
        size: 100,
        buffer: Buffer.from('a'),
      }),
    ).toBe('.png');
    expect(
      resolvePhotoExtension({
        originalname: 'avatar',
        mimetype: 'image/webp',
        size: 100,
        buffer: Buffer.from('a'),
      }),
    ).toBe('.webp');
  });

  it('uses max upload size of 5MB', () => {
    expect(SETTINGS_PHOTO_MAX_SIZE_BYTES).toBe(5 * 1024 * 1024);
    expect(SETTINGS_PHOTO_ALLOWED_MIME_TYPES.has('image/jpeg')).toBe(true);
  });
});
