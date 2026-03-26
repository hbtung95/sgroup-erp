import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProjectService } from '../../application/use-cases/project.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects/policies')
export class ProjectPolicyController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('all')
  findAllPolicies(@Query('status') status?: string) {
    return this.projectService.findAllPolicies(status);
  }

  @Post()
  createPolicy(@Body() data: any) {
    return this.projectService.createPolicy(data);
  }

  @Patch(':id')
  updatePolicy(@Param('id') id: string, @Body() data: any) {
    return this.projectService.updatePolicy(id, data);
  }

  @Delete(':id')
  deletePolicy(@Param('id') id: string) {
    return this.projectService.deletePolicy(id);
  }
}
