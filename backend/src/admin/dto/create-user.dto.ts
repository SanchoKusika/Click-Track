import { Role } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'intern6@click.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Intern Six' })
  @IsString()
  fullName!: string;

  @ApiProperty({ enum: Role, example: Role.INTERN })
  @IsEnum(Role)
  role!: Role;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: 'e9009939-2af2-44aa-9f64-1a2ee926e146' })
  @IsOptional()
  @IsString()
  mentorId?: string;
}
