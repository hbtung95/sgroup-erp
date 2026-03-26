import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class MktContentRepository {
  private readonly logger = new Logger(MktContentRepository.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.mktContent.findMany({
      orderBy: [{ scheduledDate: 'asc' }, { createdAt: 'desc' }]
    });
  }

  async createContent(data: any) {
    return this.prisma.mktContent.create({ data });
  }

  async updateContentMetrics(id: string, reach: number, engagement: number) {
    return this.prisma.mktContent.update({
      where: { id },
      data: { reach, engagement }
    });
  }
}
