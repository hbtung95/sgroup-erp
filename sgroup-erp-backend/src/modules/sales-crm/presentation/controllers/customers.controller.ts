import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CustomersService } from '../../application/services/customers.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('sales-crm/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'sales_manager', 'sales_rep')
  findAll(@Query('skip') skip?: string, @Query('take') take?: string, @Query('status') status?: string) {
    return this.customersService.findAll(skip ? +skip : undefined, take ? +take : undefined, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Post()
  create(@Body() data: any, @Body('staffId') staffId: string) {
    return this.customersService.create(data, staffId);
  }
}
