import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProjectService } from '../../application/use-cases/project.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects/docs')
export class ProjectDocController {
  constructor(private readonly projectService: ProjectService) {}

  @Get('all')
  findAllDocs(@Query('projectId') projectId?: string) {
    return this.projectService.findAllDocs(projectId);
  }

  @Post()
  createDoc(@Body() data: any) {
    return this.projectService.createDoc(data);
  }

  @Patch(':id')
  updateDoc(@Param('id') id: string, @Body() data: any) {
    return this.projectService.updateDoc(id, data);
  }

  @Delete(':id')
  deleteDoc(@Param('id') id: string) {
    return this.projectService.deleteDoc(id);
  }
}
