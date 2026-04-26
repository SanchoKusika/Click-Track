import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

import { SurveyTarget } from '@prisma/client';

export { SurveyTarget };

export class CreateSurveyQuestionDto {
  @ApiProperty({ example: 'Communication Skills' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  order!: number;
}

export class CreateSurveyDto {
  @ApiProperty({ example: 'Q2 Mentor Review' })
  @IsString()
  title!: string;

  @ApiProperty({ enum: SurveyTarget, example: SurveyTarget.MENTOR })
  @IsEnum(SurveyTarget)
  target!: SurveyTarget;

  @ApiPropertyOptional({ type: [CreateSurveyQuestionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSurveyQuestionDto)
  questions?: CreateSurveyQuestionDto[];
}
