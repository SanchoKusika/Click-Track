import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCriterionDto } from './dto/create-criterion.dto';

@Injectable()
export class CriteriaService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.criterion.findMany({ orderBy: { title: 'asc' } });
  }

  create(dto: CreateCriterionDto) {
    return this.prisma.criterion.create({ data: dto });
  }
}
