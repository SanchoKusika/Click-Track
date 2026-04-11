import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { InternService } from './intern.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  ApiErrorResponseDto,
  AssessmentResponseDto,
  LeaderboardEntryDto,
} from '../common/dto/api-models.dto';

@ApiTags('intern')
@ApiBearerAuth()
@Controller('intern')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InternController {
  constructor(private readonly internService: InternService) {}

  @Get('me/assessments')
  @Roles(Role.INTERN)
  @ApiOkResponse({ type: [AssessmentResponseDto] })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  myAssessments(@CurrentUser('sub') userId: string) {
    return this.internService.myAssessments(userId);
  }

  @Get('leaderboard')
  @Roles(Role.INTERN)
  @ApiOkResponse({ type: [LeaderboardEntryDto] })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  leaderboard() {
    return this.internService.leaderboard();
  }
}
