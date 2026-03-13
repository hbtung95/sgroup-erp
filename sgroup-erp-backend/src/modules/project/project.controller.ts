import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PropertyProductService } from './property-product.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreatePropertyProductDto } from './dto/create-property-product.dto';
import { UpdatePropertyProductDto } from './dto/update-property-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly propertyProductService: PropertyProductService,
  ) {}

  // --- Project CRUD ---
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
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }

  // --- Property Product Operations ---
  @Post(':projectId/products')
  createProduct(@Param('projectId') projectId: string, @Body() createDto: CreatePropertyProductDto) {
    createDto.projectId = projectId;
    return this.propertyProductService.create(createDto);
  }

  @Get(':projectId/products')
  findAllProductsByProject(@Param('projectId') projectId: string) {
    return this.propertyProductService.findAllByProject(projectId);
  }

  @Get('products/:productId')
  findOneProduct(@Param('productId') productId: string) {
    return this.propertyProductService.findOne(productId);
  }

  @Patch('products/:productId')
  updateProduct(@Param('productId') productId: string, @Body() updateDto: UpdatePropertyProductDto) {
    return this.propertyProductService.update(productId, updateDto);
  }

  @Delete('products/:productId')
  removeProduct(@Param('productId') productId: string) {
    return this.propertyProductService.remove(productId);
  }
}
