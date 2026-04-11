import { Module } from '@nestjs/common';
import { InternController } from './intern.controller';
import { InternService } from './intern.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [InternController],
  providers: [InternService],
})
export class InternModule {}
