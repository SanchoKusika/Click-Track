import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { UpdateSettingsDto } from './update-settings.dto';

describe('UpdateSettingsDto', () => {
  it('accepts valid phone in E.164 format', () => {
    const dto = plainToInstance(UpdateSettingsDto, { phone: '+998901234567' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects invalid phone format', () => {
    const dto = plainToInstance(UpdateSettingsDto, { phone: '90-123-45-67' });
    const errors = validateSync(dto);

    expect(errors[0]?.constraints?.matches).toBe(
      'phone must be in E.164 format',
    );
  });

  it('transforms empty phone to null', () => {
    const dto = plainToInstance(UpdateSettingsDto, { phone: '   ' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.phone).toBeNull();
  });

  it('transforms removePhoto from string true to boolean', () => {
    const dto = plainToInstance(UpdateSettingsDto, { removePhoto: 'true' });
    const errors = validateSync(dto);

    expect(errors).toHaveLength(0);
    expect(dto.removePhoto).toBe(true);
  });

  it('rejects invalid removePhoto value', () => {
    const dto = plainToInstance(UpdateSettingsDto, { removePhoto: 'wrong' });
    const errors = validateSync(dto);

    expect(errors[0]?.constraints?.isBoolean).toBe(
      'removePhoto must be a boolean value',
    );
  });
});
