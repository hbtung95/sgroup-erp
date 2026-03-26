import { Injectable } from '@nestjs/common';
import { ProjectCoreRepository } from '../../infrastructure/project-core.repository';

@Injectable()
export class ProjectCoreService {
  constructor(private readonly repo: ProjectCoreRepository) {}

  async findAll() {
    return this.repo.findAll();
  }

  async findOne(id: string) {
    return this.repo.findById(id);
  }

  // Legacy fallback compatibility
  async create(data: any) { return null; }
  async update(id: string, data: any) { return null; }
  async remove(id: string) { return null; }
}
