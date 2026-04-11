import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserSettingsDto {
  @ApiProperty({ example: '4be09f38-075b-445d-9f1c-0e6ec9eb4086' })
  id!: string;

  @ApiProperty({ example: 'admin@click.local' })
  email!: string;

  @ApiProperty({ example: 'System Admin' })
  fullName!: string;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  role!: Role;

  @ApiProperty({ example: '2026-04-02T11:04:44.276Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ example: '+998901234567', nullable: true })
  phone?: string | null;

  @ApiPropertyOptional({
    example: '/uploads/4be09f38-075b-445d-9f1c-0e6ec9eb4086.webp',
    nullable: true,
  })
  photoUrl?: string | null;
}
