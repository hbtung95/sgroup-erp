import { useState, useEffect, useCallback } from 'react';
import type { REProject, REProduct, RELegalDoc } from '../types';
import { projectApi, productApi, legalDocApi } from '../api/projectApi';

// ─── Mock Data (fallback when API unavailable) ───

const MOCK_RE_PROJECTS: REProject[] = [
  {
    id: 'proj-1', name: 'SGroup Riverside', code: 'SGR',
    description: 'Khu đô thị sinh thái ven sông với 500 biệt thự và nhà phố.',
    status: 'SELLING', type: 'VILLA', location: 'TP Thủ Đức, Hồ Chí Minh',
    developer: 'SGroup Holdings', totalUnits: 500, soldUnits: 175,
    feeRate: 2.5, avgPrice: 15000000000,
    startDate: '2026-01-01', endDate: '2028-12-31',
    managerId: 'u1', managerName: 'Trần Văn A', teamSize: 15, progress: 35,
    createdAt: '2026-01-01T00:00:00Z', tags: '["Sinh thái","Nghỉ dưỡng","Ven sông"]'
  },
  {
    id: 'proj-2', name: 'SGroup Tower Downtown', code: 'SGT',
    description: 'Chung cư cao cấp hạng A tại trung tâm hành chính.',
    status: 'UPCOMING', type: 'APARTMENT', location: 'Quận 1, Hồ Chí Minh',
    developer: 'SGroup Invest', totalUnits: 320, soldUnits: 0,
    feeRate: 3.0, avgPrice: 4500000000,
    startDate: '2026-06-01', endDate: '2029-06-01',
    managerId: 'u2', managerName: 'Lê Thị B', teamSize: 20, progress: 10,
    createdAt: '2026-02-15T00:00:00Z', tags: '["Trung tâm","Hạng A"]'
  },
  {
    id: 'proj-3', name: 'Mega Shophouse Complex', code: 'MSC',
    description: 'Tổ hợp shophouse thương mại, dịch vụ giải trí.',
    status: 'HANDOVER', type: 'SHOPHOUSE', location: 'Bình Dương',
    developer: 'SGroup Real Estate', totalUnits: 150, soldUnits: 142,
    feeRate: 2.0, avgPrice: 8000000000,
    startDate: '2024-01-01', endDate: '2026-05-30',
    managerId: 'u3', managerName: 'Phạm Đức C', teamSize: 8, progress: 95,
    createdAt: '2024-01-10T00:00:00Z', tags: '["Thương mại","Giải trí"]'
  }
];

const MOCK_RE_PRODUCTS: REProduct[] = Array.from({ length: 40 }).map((_, i) => {
  const isProj1 = i < 20;
  const statuses: REProduct['status'][] = ['AVAILABLE', 'LOCKED', 'DEPOSIT', 'SOLD', 'AVAILABLE', 'AVAILABLE'];
  return {
    id: `inv-${i}`, projectId: isProj1 ? 'proj-1' : 'proj-2',
    code: isProj1 ? `V${Math.floor(i/5)+1}-${(i%5)+1}` : `A${Math.floor((i-20)/10)+1}-${((i-20)%10)+1}`,
    status: statuses[i % statuses.length],
    type: isProj1 ? 'VILLA' : 'APARTMENT',
    block: isProj1 ? `V${Math.floor(i/5)+1}` : `A${Math.floor((i-20)/10)+1}`,
    floor: isProj1 ? 0 : ((i-20)%10)+1,
    area: isProj1 ? 250 + Math.random()*100 : 60 + Math.random()*40,
    direction: ['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Tây Bắc'][Math.floor(Math.random()*6)],
    price: isProj1 ? 15000000000 + Math.random()*5000000000 : 3000000000 + Math.random()*2000000000,
    commissionAmt: isProj1 ? 350000000 : 80000000,
    bonusAmt: isProj1 ? (Math.random() > 0.5 ? 50000000 : 0) : 0,
    bedrooms: isProj1 ? 4 : 2 + Math.floor(Math.random()*2),
    createdAt: '2026-01-01T00:00:00Z',
  };
});

const MOCK_RE_LEGAL: RELegalDoc[] = [
  {
    id: 'leg-1', projectId: 'proj-1', title: 'Cập nhật Bộ Tài liệu bán hàng (Sales Kit)',
    description: 'Flyer, Mặt bằng và Concept thiết kế 3D.', docType: 'SALESKIT',
    status: 'APPROVED', approveDate: '2026-03-01', assigneeName: 'Nguyễn Văn Admin'
  },
  {
    id: 'leg-2', projectId: 'proj-1', title: 'Chính sách bán hàng (Update Tháng 4)',
    description: 'Chờ CĐT phê duyệt chiết khấu nhanh 10%.', docType: 'CSBH',
    status: 'SUBMITTED', submitDate: '2026-04-01', assigneeName: 'Nguyễn Văn Admin'
  },
  {
    id: 'leg-3', projectId: 'proj-2', title: 'Bảng tính dòng tiền & Lịch thanh toán',
    description: 'Đang soạn thảo theo CSBH mới từ CĐT.', docType: 'SCHEDULE',
    status: 'PREPARATION', assigneeName: 'Trần Thị Sales'
  },
  {
    id: 'leg-4', projectId: 'proj-1', title: 'Mẫu Hợp đồng Môi giới',
    description: 'HĐ môi giới F1 đang vướng tỷ lệ phí với CĐT.',
    docType: 'CONTRACT', status: 'ISSUE_FIXING', submitDate: '2026-02-15', assigneeName: 'Lê Hoàng Giám Đốc'
  },
];

// ─── Hooks ───

export function useProjects() {
  const [data, setData] = useState<REProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await projectApi.list(1, 100);
      setData(res.data || []);
    } catch {
      // Fallback to mock data when API unavailable
      console.warn('[useProjects] API unavailable, using mock data');
      setData(MOCK_RE_PROJECTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  return { data, loading, error, refetch: fetchProjects };
}

export function useInventory(projectId?: string) {
  const [data, setData] = useState<REProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      if (projectId) {
        const res = await productApi.listByProject(projectId);
        setData(res.data || []);
      } else {
        // When no project filter, try to load all from all known projects
        // For now fallback to mock
        throw new Error('No project ID — use mock');
      }
    } catch {
      console.warn('[useInventory] API unavailable, using mock data');
      const db = projectId
        ? MOCK_RE_PRODUCTS.filter(i => i.projectId === projectId)
        : MOCK_RE_PRODUCTS;
      setData(db);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  return { data, loading, refetch: fetchInventory };
}

export function useLegalDocs(projectId?: string) {
  const [data, setData] = useState<RELegalDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      if (projectId) {
        const res = await legalDocApi.listByProject(projectId);
        setData(res.data || []);
      } else {
        throw new Error('No project ID — use mock');
      }
    } catch {
      console.warn('[useLegalDocs] API unavailable, using mock data');
      const db = projectId
        ? MOCK_RE_LEGAL.filter(i => i.projectId === projectId)
        : MOCK_RE_LEGAL;
      setData(db);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  return { data, loading, refetch: fetchDocs };
}

/**
 * useProject - Custom hook to fetch a single project by ID
 * Implements fallback and memoization for optimal performance.
 */
export function useProject(id?: string | null) {
  const [data, setData] = useState<REProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Typically there would be a projectApi.get(id) here
      // For now, we simulate by fetching list or using mock if no GET endpoint
      const res = await projectApi.list(1, 100);
      const found = res.data?.find((p: REProject) => p.id === id);
      if (found) {
        setData(found);
      } else {
        throw new Error('Project not found');
      }
    } catch {
      console.warn(`[useProject] API unavailable or project not found, using mock data for id: ${id}`);
      const mockFound = MOCK_RE_PROJECTS.find(p => p.id === id);
      if (mockFound) {
        setData(mockFound);
      } else {
        setError('Không tìm thấy dự án');
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  return { data, loading, error, refetch: fetchProject };
}
