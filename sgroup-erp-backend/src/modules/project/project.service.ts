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

  // ═══════════════════════════════════════════
  // POLICIES
  // ═══════════════════════════════════════════
  async findAllPolicies(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.projectPolicy.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async createPolicy(data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (Array.isArray(data.rules)) data.rules = JSON.stringify(data.rules);
    return this.prisma.projectPolicy.create({ data });
  }

  async updatePolicy(id: string, data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (Array.isArray(data.rules)) data.rules = JSON.stringify(data.rules);
    return this.prisma.projectPolicy.update({ where: { id }, data });
  }

  async deletePolicy(id: string) {
    return this.prisma.projectPolicy.delete({ where: { id } });
  }

  // ═══════════════════════════════════════════
  // DOCUMENTS (LegalProjectDoc)
  // ═══════════════════════════════════════════
  async findAllDocs(projectId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    return this.prisma.legalProjectDoc.findMany({
      where,
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDoc(data: any) {
    if (data.issuedDate) data.issuedDate = new Date(data.issuedDate);
    if (data.expiredDate) data.expiredDate = new Date(data.expiredDate);
    return this.prisma.legalProjectDoc.create({ data });
  }

  async updateDoc(id: string, data: any) {
    if (data.issuedDate) data.issuedDate = new Date(data.issuedDate);
    if (data.expiredDate) data.expiredDate = new Date(data.expiredDate);
    return this.prisma.legalProjectDoc.update({ where: { id }, data });
  }

  async deleteDoc(id: string) {
    return this.prisma.legalProjectDoc.delete({ where: { id } });
  }

  // ═══════════════════════════════════════════
  // ASSIGNMENTS
  // ═══════════════════════════════════════════
  async findAllAssignments(opts?: { projectId?: string; status?: string }) {
    const where: any = {};
    if (opts?.projectId) where.projectId = opts.projectId;
    if (opts?.status) where.status = opts.status;
    return this.prisma.projectAssignment.findMany({ where, orderBy: { assignedAt: 'desc' } });
  }

  async createAssignment(data: any) {
    return this.prisma.projectAssignment.create({ data });
  }

  async updateAssignment(id: string, data: any) {
    return this.prisma.projectAssignment.update({ where: { id }, data });
  }

  async deleteAssignment(id: string) {
    return this.prisma.projectAssignment.delete({ where: { id } });
  }
}
