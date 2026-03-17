import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProjectService } from './project.service';
import { PropertyProductService } from './property-product.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreatePropertyProductDto } from './dto/create-property-product.dto';
import { UpdatePropertyProductDto } from './dto/update-property-product.dto';
import { GenerateInventoryDto } from './dto/generate-inventory.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

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
  @UseGuards(RolesGuard)
  @Roles('admin', 'project_manager')
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }

  // --- Property Product Operations ---
  @Post(':projectId/products')
  createProduct(@Param('projectId') projectId: string, @Body() createDto: CreatePropertyProductDto) {
    createDto.projectId = projectId;
    return this.propertyProductService.create(createDto);
  }

  @Post(':projectId/products/generate')
  generateInventory(@Param('projectId') projectId: string, @Body() dto: GenerateInventoryDto) {
    return this.propertyProductService.generateInventory(projectId, dto);
  }

  @Post(':projectId/products/batch')
  @UseGuards(RolesGuard)
  @Roles('admin', 'project_manager')
  batchCreateProducts(@Param('projectId') projectId: string, @Body() items: CreatePropertyProductDto[]) {
    return this.propertyProductService.batchCreate(projectId, items);
  }

  @Get(':projectId/products')
  findAllProductsByProject(
    @Param('projectId') projectId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
  ) {
    return this.propertyProductService.findAllByProject(projectId, skip ? +skip : undefined, take ? +take : undefined, status);
  }

  @Get(':projectId/products/:productId')
  findOneProduct(@Param('productId') productId: string) {
    return this.propertyProductService.findOne(productId);
  }

  @Patch(':projectId/products/:productId')
  updateProduct(@Param('productId') productId: string, @Body() updateDto: UpdatePropertyProductDto) {
    return this.propertyProductService.update(productId, updateDto);
  }

  @Patch(':projectId/products/:productId/lock')
  @UseGuards(RolesGuard)
  @Roles('admin', 'sales_admin', 'sales_manager', 'sales_rep', 'sales_director')
  lockProduct(@Param('productId') productId: string, @Body() body: { staffName?: string }) {
    return this.propertyProductService.lockProduct(productId, body.staffName);
  }

  @Patch(':projectId/products/:productId/unlock')
  @UseGuards(RolesGuard)
  @Roles('admin', 'sales_admin', 'sales_manager', 'sales_director')
  unlockProduct(@Param('productId') productId: string) {
    return this.propertyProductService.unlockProduct(productId);
  }

  @Delete(':projectId/products/:productId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'project_manager')
  removeProduct(@Param('productId') productId: string) {
    return this.propertyProductService.remove(productId);
  }

  // --- Policies ---
  @Get('policies/all')
  findAllPolicies(@Query('status') status?: string) {
    return this.projectService.findAllPolicies(status);
  }

  @Post('policies')
  createPolicy(@Body() data: any) {
    return this.projectService.createPolicy(data);
  }

  @Patch('policies/:id')
  updatePolicy(@Param('id') id: string, @Body() data: any) {
    return this.projectService.updatePolicy(id, data);
  }

  @Delete('policies/:id')
  deletePolicy(@Param('id') id: string) {
    return this.projectService.deletePolicy(id);
  }

  // --- Documents (LegalProjectDoc) ---
  @Get('docs/all')
  findAllDocs(@Query('projectId') projectId?: string) {
    return this.projectService.findAllDocs(projectId);
  }

  @Post('docs')
  createDoc(@Body() data: any) {
    return this.projectService.createDoc(data);
  }

  @Patch('docs/:id')
  updateDoc(@Param('id') id: string, @Body() data: any) {
    return this.projectService.updateDoc(id, data);
  }

  @Delete('docs/:id')
  deleteDoc(@Param('id') id: string) {
    return this.projectService.deleteDoc(id);
  }

  // --- Assignments ---
  @Get('assignments/all')
  findAllAssignments(@Query('projectId') projectId?: string, @Query('status') status?: string) {
    return this.projectService.findAllAssignments({ projectId, status });
  }

  @Post('assignments')
  createAssignment(@Body() data: any) {
    return this.projectService.createAssignment(data);
  }

  @Patch('assignments/:id')
  updateAssignment(@Param('id') id: string, @Body() data: any) {
    return this.projectService.updateAssignment(id, data);
  }

  @Delete('assignments/:id')
  deleteAssignment(@Param('id') id: string) {
    return this.projectService.deleteAssignment(id);
  }
}
