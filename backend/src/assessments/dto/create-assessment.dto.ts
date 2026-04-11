import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateAssessmentDto {
  @ApiProperty({ example: '148a10d9-885c-43e2-beb2-12b41cbdf367' })
  @IsString()
  internId!: string;

  @ApiProperty({ example: 'criterion-react' })
  @IsString()
  criterionId!: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;

  @ApiPropertyOptional({ example: 'Strong progress in hooks and composition' })
  @IsOptional()
  @IsString()
  comment?: string;
}
