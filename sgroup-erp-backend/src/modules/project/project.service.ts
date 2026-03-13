import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    return this.prisma.dimProject.create({
      data: createProjectDto,
    });
  }

  async findAll() {
    return this.prisma.dimProject.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { legalDocs: true, products: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.dimProject.findUnique({
      where: { id },
      include: {
        products: { orderBy: { code: 'asc' } },
        _count: {
          select: { legalDocs: true, products: true }
        }
      }
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id); // verify exists
    return this.prisma.dimProject.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.dimProject.delete({
      where: { id },
    });
  }
}
