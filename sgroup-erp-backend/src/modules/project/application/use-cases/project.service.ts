import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { IProjectRepository } from '../../domain/repositories/project.repository.interface';
import { CreateProjectDto } from '../../presentation/dtos/create-project.dto';
import { UpdateProjectDto } from '../../presentation/dtos/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepo: IProjectRepository,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    return this.projectRepo.create(createProjectDto);
  }

  async findAll() {
    return this.projectRepo.findAll();
  }

  async findOne(id: string) {
    const project = await this.projectRepo.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id); // verify exists
    return this.projectRepo.update(id, updateProjectDto);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.projectRepo.delete(id);
  }

  // ═══════════════════════════════════════════
  // POLICIES
  // ═══════════════════════════════════════════
  async findAllPolicies(status?: string) {
    return this.projectRepo.findAllPolicies(status);
  }

  async createPolicy(data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (Array.isArray(data.rules)) data.rules = JSON.stringify(data.rules);
    return this.projectRepo.createPolicy(data);
  }

  async updatePolicy(id: string, data: any) {
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (Array.isArray(data.rules)) data.rules = JSON.stringify(data.rules);
    return this.projectRepo.updatePolicy(id, data);
  }

  async deletePolicy(id: string) {
    return this.projectRepo.deletePolicy(id);
  }

  // ═══════════════════════════════════════════
  // DOCUMENTS (LegalProjectDoc)
  // ═══════════════════════════════════════════
  async findAllDocs(projectId?: string) {
    return this.projectRepo.findAllDocs(projectId);
  }

  async createDoc(data: any) {
    if (data.issuedDate) data.issuedDate = new Date(data.issuedDate);
    if (data.expiredDate) data.expiredDate = new Date(data.expiredDate);
    return this.projectRepo.createDoc(data);
  }

  async updateDoc(id: string, data: any) {
    if (data.issuedDate) data.issuedDate = new Date(data.issuedDate);
    if (data.expiredDate) data.expiredDate = new Date(data.expiredDate);
    return this.projectRepo.updateDoc(id, data);
  }

  async deleteDoc(id: string) {
    return this.projectRepo.deleteDoc(id);
  }

  // ═══════════════════════════════════════════
  // ASSIGNMENTS
  // ═══════════════════════════════════════════
  async findAllAssignments(opts?: { projectId?: string; status?: string }) {
    return this.projectRepo.findAllAssignments(opts);
  }

  async createAssignment(data: any) {
    return this.projectRepo.createAssignment(data);
  }

  async updateAssignment(id: string, data: any) {
    return this.projectRepo.updateAssignment(id, data);
  }

  async deleteAssignment(id: string) {
    return this.projectRepo.deleteAssignment(id);
  }
}
