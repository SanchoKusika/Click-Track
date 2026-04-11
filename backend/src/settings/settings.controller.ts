import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiErrorResponseDto } from '../common/dto/api-models.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  UpdateSettingsDto,
  UpdateSettingsMultipartDto,
} from './dto/update-settings.dto';
import { UserSettingsDto } from './dto/user-settings.dto';
import { SettingsService } from './settings.service';

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOkResponse({ type: UserSettingsDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  me(@CurrentUser('sub') userId: string) {
    return this.settingsService.me(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateSettingsMultipartDto })
  @ApiOkResponse({ type: UserSettingsDto })
  @ApiBadRequestResponse({ type: ApiErrorResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  updateMe(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateSettingsDto,
    @UploadedFile() photo?: unknown,
  ) {
    return this.settingsService.updateMe(userId, dto, photo);
  }
}
