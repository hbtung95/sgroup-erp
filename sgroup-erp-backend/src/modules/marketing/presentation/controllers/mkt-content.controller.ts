import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MktContentRepository } from '../../infrastructure/repositories/mkt-content.repository';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('marketing/content')
export class MktContentController {
  constructor(private readonly contentRepo: MktContentRepository) {}

  @Get()
  @Roles('admin', 'cmo', 'marketing_manager', 'marketing_staff')
  findAll() {
    return this.contentRepo.findAll();
  }

  @Post()
  @Roles('admin', 'cmo', 'marketing_manager', 'marketing_staff')
  createContent(@Body() data: any) {
    return this.contentRepo.createContent(data);
  }

  @Post(':id/metrics')
  @Roles('admin', 'cmo', 'marketing_manager')
  updateMetrics(@Param('id') id: string, @Body() data: { reach: number; engagement: number }) {
    return this.contentRepo.updateContentMetrics(id, data.reach, data.engagement);
  }
}
