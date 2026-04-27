import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: DEFAULT_PAGE, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
    default: DEFAULT_PAGE_SIZE,
    example: DEFAULT_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function resolvePagination(query: PaginationQueryDto) {
  const page = query.page ?? DEFAULT_PAGE;
  const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
  return {
    page,
    pageSize,
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}
