import {
  Controller, Get, Post, Patch, Body, Param,
  Query, UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('products')
@UseGuards(RolesGuard)
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async findAll(
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('block') block?: string,
    @Query('bedrooms') bedrooms?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    return this.service.findAll({
      projectId, status, block,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
  }

  @Get('stats')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async getStats(@Query('projectId') projectId?: string) {
    return this.service.getStats(projectId);
  }

  @Get(':id')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'ceo', 'sales_admin')
  async findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Roles('admin', 'employee', 'team_lead', 'sales_director', 'sales_admin')
  async create(@Body() body: {
    projectId: string; projectName?: string; code: string;
    block?: string; floor?: number; area?: number;
    price?: number; direction?: string; bedrooms?: number;
    note?: string;
  }) {
    return this.service.create(body);
  }

  @Patch(':id')
  @Roles('admin', 'employee', 'team_lead', 'sales_director', 'sales_admin')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.service.update(id, body);
  }

  @Post(':id/lock')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_admin')
  async lockUnit(@Param('id') id: string, @Body() body: { bookedBy: string; durationMinutes?: number }) {
    return this.service.lockUnit(id, body);
  }

  @Post(':id/deposit')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_admin')
  async requestDeposit(@Param('id') id: string, @Body() body: { customerName: string; customerPhone: string }) {
    return this.service.requestDeposit(id, body);
  }

  @Post(':id/approve')
  @Roles('admin', 'employee', 'team_lead', 'sales_director', 'sales_admin')
  async approveDeposit(@Param('id') id: string) {
    return this.service.approveDeposit(id);
  }

  @Post(':id/cancel')
  @Roles('admin', 'employee', 'sales', 'team_lead', 'sales_manager', 'sales_director', 'sales_admin')
  async cancelBooking(@Param('id') id: string) {
    return this.service.cancelBooking(id);
  }
}
