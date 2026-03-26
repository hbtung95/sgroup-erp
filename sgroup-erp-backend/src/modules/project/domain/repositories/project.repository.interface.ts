export interface IProjectRepository {
  create(data: any): Promise<any>;
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<any>;

  findAllPolicies(status?: string): Promise<any[]>;
  createPolicy(data: any): Promise<any>;
  updatePolicy(id: string, data: any): Promise<any>;
  deletePolicy(id: string): Promise<any>;

  findAllDocs(projectId?: string): Promise<any[]>;
  createDoc(data: any): Promise<any>;
  updateDoc(id: string, data: any): Promise<any>;
  deleteDoc(id: string): Promise<any>;

  findAllAssignments(opts?: { projectId?: string; status?: string }): Promise<any[]>;
  createAssignment(data: any): Promise<any>;
  updateAssignment(id: string, data: any): Promise<any>;
  deleteAssignment(id: string): Promise<any>;
}
