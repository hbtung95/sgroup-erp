import { Injectable, NotFoundException } from '@nestjs/common';
import { EmployeeRepository } from '../infrastructure/employee.repository';
import { CreateEmployeeDto } from '../domain/dtos/create-employee.dto';
import { UpdateEmployeeDto } from '../domain/dtos/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private readonly employeeRepo: EmployeeRepository) {}

  async createEmployee(dto: CreateEmployeeDto) {
    // In Clean Architecture, the use case validates domain rules here
    return this.employeeRepo.create({
      ...dto,
      joinDate: new Date(dto.joinDate),
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
    });
  }

  async getEmployeeById(id: string) {
    const employee = await this.employeeRepo.findById(id);
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async getAllEmployees(search?: string, departmentId?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    
    // Construct Prisma where clause intelligently
    const whereCondition: any = {};
    if (search) {
      whereCondition.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeCode: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (departmentId) {
      whereCondition.departmentId = departmentId;
    }
    
    // RED FLAG: Must avoid getting deleted users. Wait, status is string.
    whereCondition.status = { not: 'TERMINATED' };

    return this.employeeRepo.findAll({
      skip,
      take: limit,
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto) {
    await this.getEmployeeById(id); // Check existence
    
    const updateData: any = { ...dto };
    if (dto.joinDate) updateData.joinDate = new Date(dto.joinDate);
    if (dto.dateOfBirth) updateData.dateOfBirth = new Date(dto.dateOfBirth);

    return this.employeeRepo.update(id, updateData);
  }

  async terminateEmployee(id: string) {
    await this.getEmployeeById(id);
    return this.employeeRepo.softDelete(id); // Enforces soft delete red flag
  }
}
