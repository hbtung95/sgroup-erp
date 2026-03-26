export interface IPropertyProductRepository {
  create(data: any): Promise<any>;
  findAllByProject(projectId: string, skip?: number, take?: number, status?: string): Promise<{ data: any[]; total: number }>;
  findById(id: string): Promise<any | null>;
  findByCode(code: string): Promise<any[]>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<any>;

  lockProduct(id: string, staffName: string | null, lockedUntil: Date): Promise<any>;
  unlockProduct(id: string): Promise<any>;
  unlockExpiredLocks(): Promise<number>;

  countSold(projectId: string): Promise<number>;
  countTotal(projectId: string): Promise<number>;
  updateProjectUnits(projectId: string, soldUnits?: number, totalUnits?: number): Promise<void>;

  batchCreate(data: any[]): Promise<any>;
  findExistingCodes(projectId: string, codes: string[]): Promise<string[]>;

  logStatusChange(productId: string, oldStatus: string, newStatus: string, changedBy?: string, reason?: string): Promise<void>;
}
