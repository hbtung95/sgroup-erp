import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IProjectRepository } from '../../domain/repositories/project.repository.interface';

@Injectable()
export class PrismaProjectRepository implements IProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any): Promise<any> {
    return this.prisma.dimProject.create({ data });
  }

  async findAll(): Promise<any[]> {
    return this.prisma.dimProject.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { legalDocs: true, products: true }
        }
      }
    });
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.dimProject.findUnique({
      where: { id },
      include: {
        products: { orderBy: { code: 'asc' } },
        _count: {
          select: { legalDocs: true, products: true }
        }
      }
    });
  }

  async update(id: string, data: any): Promise<any> {
    return this.prisma.dimProject.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<any> {
    return this.prisma.dimProject.delete({
      where: { id },
    });
  }

  // ═══════════════════════════════════════════
  // POLICIES
  // ═══════════════════════════════════════════
  async findAllPolicies(status?: string): Promise<any[]> {
    const where: any = {};
    if (status) where.status = status;
    return this.prisma.projectPolicy.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async createPolicy(data: any): Promise<any> {
    return this.prisma.projectPolicy.create({ data });
  }

  async updatePolicy(id: string, data: any): Promise<any> {
    return this.prisma.projectPolicy.update({ where: { id }, data });
  }

  async deletePolicy(id: string): Promise<any> {
    return this.prisma.projectPolicy.delete({ where: { id } });
  }

  // ═══════════════════════════════════════════
  // DOCUMENTS
  // ═══════════════════════════════════════════
  async findAllDocs(projectId?: string): Promise<any[]> {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    return this.prisma.legalProjectDoc.findMany({
      where,
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDoc(data: any): Promise<any> {
    return this.prisma.legalProjectDoc.create({ data });
  }

  async updateDoc(id: string, data: any): Promise<any> {
    return this.prisma.legalProjectDoc.update({ where: { id }, data });
  }

  async deleteDoc(id: string): Promise<any> {
    return this.prisma.legalProjectDoc.delete({ where: { id } });
  }

  // ═══════════════════════════════════════════
  // ASSIGNMENTS
  // ═══════════════════════════════════════════
  async findAllAssignments(opts?: { projectId?: string; status?: string }): Promise<any[]> {
    const where: any = {};
    if (opts?.projectId) where.projectId = opts.projectId;
    if (opts?.status) where.status = opts.status;
    return this.prisma.projectAssignment.findMany({ where, orderBy: { assignedAt: 'desc' } });
  }

  async createAssignment(data: any): Promise<any> {
    return this.prisma.projectAssignment.create({ data });
  }

  async updateAssignment(id: string, data: any): Promise<any> {
    return this.prisma.projectAssignment.update({ where: { id }, data });
  }

  async deleteAssignment(id: string): Promise<any> {
    return this.prisma.projectAssignment.delete({ where: { id } });
  }
}
