import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProjectService } from '../../application/use-cases/project.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects/assignments')
export class ProjectAssignmentController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('all')
  findAllAssignments(@Query('projectId') projectId?: string, @Query('status') status?: string) {
    return this.projectService.findAllAssignments({ projectId, status });
  }

  @Post()
  createAssignment(@Body() data: any) {
    return this.projectService.createAssignment(data);
  }

  @Patch(':id')
  updateAssignment(@Param('id') id: string, @Body() data: any) {
    return this.projectService.updateAssignment(id, data);
  }

  @Delete(':id')
  deleteAssignment(@Param('id') id: string) {
    return this.projectService.deleteAssignment(id);
  }
}
