import { Module } from '@nestjs/common';
import { InternProfilesController } from './intern-profiles.controller';
import { InternProfilesService } from './intern-profiles.service';

@Module({
  controllers: [InternProfilesController],
  providers: [InternProfilesService],
})
export class InternProfilesModule {}
