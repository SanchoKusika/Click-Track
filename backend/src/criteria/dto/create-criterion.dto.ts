import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateCriterionDto {
  @ApiProperty({ example: 'React Knowledge' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'Component architecture and hooks' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  maxScore!: number;
}
