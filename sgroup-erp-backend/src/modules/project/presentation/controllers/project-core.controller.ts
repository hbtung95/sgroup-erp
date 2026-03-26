import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProjectService } from '../../application/use-cases/project.service';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { UpdateProjectDto } from '../dtos/update-project.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('projects/core')
export class ProjectCoreController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Body() createDto: CreateProjectDto) {
    return this.projectService.create(createDto);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateProjectDto) {
    return this.projectService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'project_manager')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }
}
