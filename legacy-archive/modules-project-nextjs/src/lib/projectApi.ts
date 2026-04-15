import type { Project, Product, LegalDoc, DashboardStats, StatusCount, ApiResponse, CreateProjectForm, CreateProductForm } from "./types";

// ==================== IN-MEMORY MOCK DATA ====================

const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    code: "VHGP",
    name: "Vinhomes Grand Park",
    description: "Khu đô thị sinh thái thông minh",
    developer: "Vingroup",
    location: "Q9, TP. Thủ Đức",
    province: "Hồ Chí Minh",
    district: "Quận 9",
    type: "APARTMENT",
    status: "SELLING",
    feeRate: 3.5,
    totalUnits: 1500,
    soldUnits: 850,
    avgPrice: 3.2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-2",
    code: "AQC",
    name: "Aqua City",
    description: "Đô thị sinh thái thông minh phía Đông",
    developer: "Novaland",
    location: "Biên Hòa, Đồng Nai",
    province: "Đồng Nai",
    district: "Biên Hòa",
    type: "VILLA",
    status: "SELLING",
    feeRate: 4.0,
    totalUnits: 800,
    soldUnits: 320,
    avgPrice: 15.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "proj-3",
    code: "TGC",
    name: "The Global City",
    description: "Khu đô thị quốc tế An Phú",
    developer: "Masterise Homes",
    location: "An Phú, TP. Thủ Đức",
    province: "Hồ Chí Minh",
    district: "TP. Thủ Đức",
    type: "SHOPHOUSE",
    status: "UPCOMING",
    feeRate: 3.0,
    totalUnits: 500,
    soldUnits: 0,
    avgPrice: 35.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let MOCK_PRODUCTS: Product[] = [
  // Vinhomes Grand Park (proj-1)
  { id: "prd-1", projectId: "proj-1", code: "VHO-S1.01-05", block: "S1.01", floor: 5, area: 45.5, price: 3.25, direction: "Đông", bedrooms: 1, status: "AVAILABLE", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "prd-2", projectId: "proj-1", code: "VHO-S2.05-12A", block: "S2.05", floor: 12, area: 68.0, price: 4.10, direction: "Nam", bedrooms: 2, status: "AVAILABLE", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "prd-3", projectId: "proj-1", code: "VHO-S1.02-15", block: "S1.02", floor: 15, area: 55.4, price: 2.85, direction: "Đông Nam", bedrooms: 2, status: "LOCKED", bookedBy: "Trần Minh Khôi (SGR-003)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "prd-4", projectId: "proj-1", code: "VHO-S3.01-20", block: "S3.01", floor: 20, area: 88.0, price: 5.50, direction: "Tây Bắc", bedrooms: 3, status: "LOCKED", bookedBy: "Lê Thị Hồng Nhung (SGR-004)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "prd-5", projectId: "proj-1", code: "VHO-S1.01-08", block: "S1.01", floor: 8, area: 45.5, price: 2.95, direction: "Bắc", bedrooms: 1, status: "DEPOSIT", bookedBy: "Trần Minh Khôi (SGR-003)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "prd-6", projectId: "proj-1", code: "VHO-S1.05-22", block: "S1.05", floor: 22, area: 72.0, price: 3.80, direction: "Nam", bedrooms: 2, status: "SOLD", bookedBy: "Trần Minh Khôi (SGR-003)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "prd-7", projectId: "proj-1", code: "VHO-S6.01-10", block: "S6.01", floor: 10, area: 47.0, price: 3.30, direction: "Đông", bedrooms: 1, status: "AVAILABLE", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "prd-8", projectId: "proj-1", code: "VHO-S6.02-30", block: "S6.02", floor: 30, area: 90.0, price: 6.00, direction: "Nam", bedrooms: 3, status: "SOLD", bookedBy: "Lê Thị Hồng Nhung (SGR-004)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  // Aqua City (proj-2)
  { id: "prd-9", projectId: "proj-2", code: "AQC-SV-01", block: "Sun Harbor", floor: 1, area: 120.0, price: 15.50, direction: "Nam", bedrooms: 4, status: "AVAILABLE", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "prd-10", projectId: "proj-2", code: "AQC-SV-15", block: "Sun Harbor", floor: 1, area: 160.0, price: 18.20, direction: "Đông", bedrooms: 5, status: "SOLD", bookedBy: "Trần Minh Khôi (SGR-003)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "prd-11", projectId: "proj-2", code: "AQC-EP-08", block: "Ever Green", floor: 1, area: 110.0, price: 12.00, direction: "Tây", bedrooms: 3, status: "COMPLETED", bookedBy: "Trần Minh Khôi (SGR-003)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: "prd-12", projectId: "proj-2", code: "AQC-RV-05", block: "River Park", floor: 1, area: 200.0, price: 25.00, direction: "Nam", bedrooms: 5, status: "AVAILABLE", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

let MOCK_DOCS: LegalDoc[] = [
  { id: "doc-1", projectId: "proj-1", title: "Giấy phép xây dựng 2026", docType: "Giấy phép xây dựng", fileUrl: "https://example.com/gp.pdf", status: "APPROVED", uploadedBy: "Admin", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==================== Projects ====================

export async function listProjects(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<Project[]>> {
  await delay(300);
  return { data: MOCK_PROJECTS, total: MOCK_PROJECTS.length, page: 1, limit: 10 };
}

export async function getProject(id: string): Promise<Project> {
  await delay(300);
  const proj = MOCK_PROJECTS.find(p => p.id === id);
  if (!proj) throw new Error("Project not found");
  return proj;
}

export async function createProject(data: CreateProjectForm): Promise<Project> {
  await delay(500);
  const newProj: Project = {
    id: `proj-${Date.now()}`,
    ...data,
    totalUnits: 0,
    soldUnits: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_PROJECTS.push(newProj);
  return newProj;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  await delay(400);
  const idx = MOCK_PROJECTS.findIndex(p => p.id === id);
  if (idx > -1) {
    MOCK_PROJECTS[idx] = { ...MOCK_PROJECTS[idx], ...data, updatedAt: new Date().toISOString() };
    return MOCK_PROJECTS[idx];
  }
  throw new Error("Not found");
}

export async function deleteProject(id: string): Promise<void> {
  await delay(400);
  const idx = MOCK_PROJECTS.findIndex(p => p.id === id);
  if (idx > -1) MOCK_PROJECTS.splice(idx, 1);
}

// ==================== Products ====================

export async function listProducts(projectId: string, params?: {
  page?: number; limit?: number; status?: string; block?: string; search?: string; sort?: string; bedrooms?: number;
}): Promise<ApiResponse<Product[]>> {
  await delay(300);
  const data = MOCK_PRODUCTS.filter(p => p.projectId === projectId);
  return { data, total: data.length, page: 1, limit: 1000 };
}

export async function createProduct(projectId: string, data: CreateProductForm): Promise<Product> {
  await delay(400);
  const newProd: Product = { id: `prd-${Date.now()}`, projectId, status: "AVAILABLE", createdAt: new Date().toISOString(), ...data } as any;
  MOCK_PRODUCTS.push(newProd);
  return newProd;
}

export async function batchCreateProducts(projectId: string, products: CreateProductForm[]): Promise<{ created: number }> {
  await delay(600);
  products.forEach(p => {
      MOCK_PRODUCTS.push({ id: `prd-${Date.now()}-${Math.random()}`, projectId, status: "AVAILABLE", createdAt: new Date().toISOString(), ...p } as any);
  });
  return { created: products.length };
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product> {
  await delay(300);
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
  if (idx > -1) {
    MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], ...data, updatedAt: new Date().toISOString() };
    return MOCK_PRODUCTS[idx];
  }
  throw new Error("Not found");
}

export async function deleteProduct(id: string): Promise<void> {
  await delay(300);
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
  if (idx > -1) MOCK_PRODUCTS.splice(idx, 1);
}

// ==================== Product Actions ====================

export async function lockProduct(id: string, bookedBy: string): Promise<void> {
  await delay(400);
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
  if (idx > -1) MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], status: "LOCKED", bookedBy };
}

export async function unlockProduct(id: string, requestedBy: string, isAdmin: boolean = false): Promise<void> {
  await delay(300);
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
  if (idx > -1) MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], status: "AVAILABLE", bookedBy: undefined };
}

export async function depositProduct(id: string, requestedBy: string): Promise<void> {
  await delay(400);
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
  if (idx > -1) MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], status: "DEPOSIT", bookedBy: requestedBy };
}

export async function soldProduct(id: string, requestedBy: string): Promise<void> {
  await delay(500);
  const idx = MOCK_PRODUCTS.findIndex(p => p.id === id);
  if (idx > -1) MOCK_PRODUCTS[idx] = { ...MOCK_PRODUCTS[idx], status: "SOLD", bookedBy: requestedBy };
}

// ==================== Dashboard ====================

export async function getDashboardStats(): Promise<DashboardStats> {
  await delay(200);
  const soldProds = MOCK_PRODUCTS.filter(p => p.status === "SOLD" || p.status === "COMPLETED");
  const totalRevenue = MOCK_PRODUCTS.reduce((acc, cur) => acc + cur.price, 0);
  const avgFeeRate = MOCK_PROJECTS.reduce((a, p) => a + p.feeRate, 0) / Math.max(1, MOCK_PROJECTS.length);
  return {
    totalProjects: MOCK_PROJECTS.length,
    activeProjects: MOCK_PROJECTS.filter(p => p.status === "SELLING").length,
    completedProjects: MOCK_PRODUCTS.filter(p => p.status === "COMPLETED").length,
    totalProducts: MOCK_PRODUCTS.length,
    totalUnits: MOCK_PROJECTS.reduce((a, p) => a + p.totalUnits, 0),
    availableProducts: MOCK_PRODUCTS.filter(p => p.status === "AVAILABLE").length,
    lockedProducts: MOCK_PRODUCTS.filter(p => p.status === "LOCKED").length,
    soldProducts: soldProds.length,
    soldUnits: MOCK_PROJECTS.reduce((a, p) => a + p.soldUnits, 0),
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalCommission: parseFloat((soldProds.reduce((a, p) => a + p.price, 0) * avgFeeRate / 100).toFixed(2)),
    absorptionRate: Math.round((soldProds.length / Math.max(1, MOCK_PRODUCTS.length)) * 100)
  };
}

export async function getStatusBreakdown(projectId: string): Promise<StatusCount[]> {
  await delay(200);
  const stats: Record<string, number> = {};
  MOCK_PRODUCTS.filter(p => p.projectId === projectId).forEach(p => {
      stats[p.status] = (stats[p.status] || 0) + 1;
  });
  return Object.keys(stats).map(status => ({ status, count: stats[status] }));
}

export async function getTotalStatusBreakdown(): Promise<StatusCount[]> {
  await delay(200);
  const stats: Record<string, number> = {};
  MOCK_PRODUCTS.forEach(p => {
      stats[p.status] = (stats[p.status] || 0) + 1;
  });
  return Object.keys(stats).map(status => ({ status, count: stats[status] }));
}

// ==================== Legal Docs ====================

export async function listDocs(projectId: string): Promise<LegalDoc[]> {
  await delay(200);
  return MOCK_DOCS.filter(d => d.projectId === projectId);
}

export async function uploadDoc(projectId: string, data: { title: string; docType: string; fileUrl: string; description?: string }): Promise<LegalDoc> {
  await delay(500);
  const newDoc: LegalDoc = {
      id: `doc-${Date.now()}`, projectId, status: "PREPARATION", uploadedBy: "Admin", createdAt: new Date().toISOString(), ...data
  } as any;
  MOCK_DOCS.push(newDoc);
  return newDoc;
}

export async function updateDocStatus(projectId: string, docId: string, status: string): Promise<void> {
  await delay(300);
  const idx = MOCK_DOCS.findIndex(d => d.id === docId);
  if (idx > -1) MOCK_DOCS[idx] = { ...MOCK_DOCS[idx], status: status as any };
}

export async function deleteDoc(projectId: string, docId: string): Promise<void> {
  await delay(300);
  const idx = MOCK_DOCS.findIndex(d => d.id === docId);
  if (idx > -1) MOCK_DOCS.splice(idx, 1);
}
