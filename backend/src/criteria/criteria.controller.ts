import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CriteriaService } from './criteria.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateCriterionDto } from './dto/create-criterion.dto';
import {
  ApiErrorResponseDto,
  CriterionResponseDto,
} from '../common/dto/api-models.dto';

@ApiTags('criteria')
@ApiBearerAuth()
@Controller('criteria')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CriteriaController {
  constructor(private readonly criteriaService: CriteriaService) {}

  @Get()
  @ApiOkResponse({ type: [CriterionResponseDto] })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  list() {
    return this.criteriaService.list();
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBody({ type: CreateCriterionDto })
  @ApiCreatedResponse({ type: CriterionResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  create(@Body() dto: CreateCriterionDto) {
    return this.criteriaService.create(dto);
  }
}
