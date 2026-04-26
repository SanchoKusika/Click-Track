import {
  BadRequestException,
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
import type { Request } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiErrorResponseDto } from '../common/dto/api-models.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  UpdateSettingsDto,
  UpdateSettingsMultipartDto,
} from './dto/update-settings.dto';
import { UserSettingsDto } from './dto/user-settings.dto';
import { SETTINGS_PHOTO_ALLOWED_MIME_TYPES } from './settings-upload.config';
import { SettingsService } from './settings.service';

type MulterFileFilterCallback = (error: Error | null, accept: boolean) => void;

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
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: {
        files: 1,
        fileSize: Number(process.env.UPLOAD_MAX_SIZE_BYTES ?? 5 * 1024 * 1024),
      },
      fileFilter: (
        _req: Request,
        file: { mimetype: string },
        cb: MulterFileFilterCallback,
      ) => {
        if (!SETTINGS_PHOTO_ALLOWED_MIME_TYPES.has(file.mimetype)) {
          cb(
            new BadRequestException('photo must be a JPEG, PNG, or WebP image'),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
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
