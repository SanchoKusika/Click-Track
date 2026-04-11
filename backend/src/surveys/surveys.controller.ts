import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  MySurveyDto,
  SurveyListItemDto,
  SurveyResponseViewDto,
} from '../common/dto/api-models.dto';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { SubmitSurveyResponseDto } from './dto/submit-survey-response.dto';
import { SurveysService } from './surveys.service';

@ApiTags('surveys')
@ApiBearerAuth()
@Controller('surveys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Get('my')
  @Roles(Role.MENTOR, Role.INTERN)
  @ApiOkResponse({ type: [MySurveyDto] })
  getMySurveys(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.surveysService.getMySurveys(userId, role);
  }

  @Get('responses/:surveyId')
  @Roles(Role.ADMIN)
  @ApiParam({ name: 'surveyId', type: String })
  @ApiOkResponse({ type: [SurveyResponseViewDto] })
  getResponses(@Param('surveyId') surveyId: string) {
    return this.surveysService.getResponses(surveyId);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOkResponse({ type: [SurveyListItemDto] })
  listAll() {
    return this.surveysService.listAll();
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBody({ type: CreateSurveyDto })
  @ApiCreatedResponse({ type: SurveyListItemDto })
  create(@Body() dto: CreateSurveyDto) {
    return this.surveysService.create(dto);
  }

  @Post(':id/respond')
  @Roles(Role.MENTOR, Role.INTERN)
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: SubmitSurveyResponseDto })
  @ApiCreatedResponse()
  respond(
    @Param('id') surveyId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: SubmitSurveyResponseDto,
  ) {
    return this.surveysService.respond(surveyId, userId, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse()
  delete(@Param('id') id: string) {
    return this.surveysService.delete(id);
  }
}
