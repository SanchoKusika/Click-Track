import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import {
  AssessmentResponseDto,
  ApiErrorResponseDto,
  MentorAllInternListItemDto,
  MentorInternDetailDto,
  MentorInternListItemDto,
} from '../common/dto/api-models.dto';

@ApiTags('assessments')
@ApiBearerAuth()
@Controller('assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MENTOR)
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get('mentor/interns/all')
  @ApiOkResponse({ type: [MentorAllInternListItemDto] })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  listAllInterns() {
    return this.assessmentsService.listAllInterns();
  }

  @Get('mentor/interns')
  @ApiOkResponse({ type: [MentorInternListItemDto] })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  listMentorInterns(@CurrentUser('sub') mentorId: string) {
    return this.assessmentsService.listMentorInterns(mentorId);
  }

  @Get('mentor/interns/:internId')
  @ApiParam({ name: 'internId', type: String })
  @ApiOkResponse({ type: MentorInternDetailDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  mentorInternDetail(
    @CurrentUser('sub') mentorId: string,
    @Param('internId') internId: string,
  ) {
    return this.assessmentsService.mentorInternDetail(mentorId, internId);
  }

  @Post()
  @ApiBody({ type: CreateAssessmentDto })
  @ApiCreatedResponse({ type: AssessmentResponseDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  create(
    @CurrentUser('sub') mentorId: string,
    @Body() dto: CreateAssessmentDto,
  ) {
    return this.assessmentsService.createByMentor(mentorId, dto);
  }

  @Post('mentor/interns/:internId/assign')
  @ApiParam({ name: 'internId', type: String })
  @ApiOkResponse({ type: MentorAllInternListItemDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  @ApiNotFoundResponse({ type: ApiErrorResponseDto })
  assignIntern(
    @CurrentUser('sub') mentorId: string,
    @Param('internId') internId: string,
  ) {
    return this.assessmentsService.assignIntern(mentorId, internId);
  }
}
