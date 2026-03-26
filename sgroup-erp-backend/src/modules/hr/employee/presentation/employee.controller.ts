import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { EmployeeService } from '../application/employee.service';
import { CreateEmployeeDto } from '../domain/dtos/create-employee.dto';
import { UpdateEmployeeDto } from '../domain/dtos/update-employee.dto';

@Controller('hr/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateEmployeeDto) {
    // Red Flag Adherence: DTO validation is handled globally via global ValidationPipe
    return this.employeeService.createEmployee(createDto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    
    return this.employeeService.getAllEmployees(search, departmentId, pageNumber, limitNumber);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeeService.getEmployeeById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
    return this.employeeService.updateEmployee(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    // Soft delete enforced by Application/Infrastructure layer
    await this.employeeService.terminateEmployee(id);
  }
}
