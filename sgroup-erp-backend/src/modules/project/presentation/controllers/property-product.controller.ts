import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PropertyProductService } from '../../application/use-cases/property-product.service';
import { CreatePropertyProductDto } from '../dtos/create-property-product.dto';
import { UpdatePropertyProductDto } from '../dtos/update-property-product.dto';
import { GenerateInventoryDto } from '../dtos/generate-inventory.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('projects/:projectId/products')
export class PropertyProductController {
  constructor(private readonly propertyProductService: PropertyProductService) {}

  @Post()
  createProduct(@Param('projectId') projectId: string, @Body() createDto: CreatePropertyProductDto) {
    createDto.projectId = projectId;
    return this.propertyProductService.create(createDto);
  }

  @Post('generate')
  generateInventory(@Param('projectId') projectId: string, @Body() dto: GenerateInventoryDto) {
    return this.propertyProductService.generateInventory(projectId, dto);
  }

  @Post('batch')
  @UseGuards(RolesGuard)
  @Roles('admin', 'project_manager')
  batchCreateProducts(@Param('projectId') projectId: string, @Body() items: CreatePropertyProductDto[]) {
    return this.propertyProductService.batchCreate(projectId, items);
  }

  @Get()
  findAllProductsByProject(
    @Param('projectId') projectId: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
  ) {
    return this.propertyProductService.findAllByProject(projectId, skip ? +skip : undefined, take ? +take : undefined, status);
  }

  @Get(':productId')
  findOneProduct(@Param('productId') productId: string) {
    return this.propertyProductService.findOne(productId);
  }

  @Patch(':productId')
  updateProduct(@Param('productId') productId: string, @Body() updateDto: UpdatePropertyProductDto) {
    return this.propertyProductService.update(productId, updateDto);
  }

  @Patch(':productId/lock')
  @UseGuards(RolesGuard)
  @Roles('admin', 'sales_admin', 'sales_manager', 'sales_rep', 'sales_director')
  lockProduct(@Param('productId') productId: string, @Body() body: { staffName?: string }) {
    return this.propertyProductService.lockProduct(productId, body.staffName);
  }

  @Patch(':productId/unlock')
  @UseGuards(RolesGuard)
  @Roles('admin', 'sales_admin', 'sales_manager', 'sales_director')
  unlockProduct(@Param('productId') productId: string) {
    return this.propertyProductService.unlockProduct(productId);
  }

  @Delete(':productId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'project_manager')
  removeProduct(@Param('productId') productId: string) {
    return this.propertyProductService.remove(productId);
  }
}
