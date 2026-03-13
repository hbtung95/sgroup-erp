/**
 * useInventoryData — Hook for inventory/products data
 * Now uses real API via productsApi instead of deprecated Zustand stubs
 */
import { useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';
import { useSalesStore } from '../store/useSalesStore';

export type UnitStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED' | 'PENDING_DEPOSIT' | 'DEPOSIT' | 'SOLD' | 'WAITING_CONTRACT' | 'COMPLETED';

export interface PropertyUnit {
  id: string;
  code: string;
  block: string;
  floor: number;
  area: number;
  bedrooms: number;
  direction: string;
  price: number;
  status: UnitStatus;
  bookedBy?: string;
  lockedUntil?: Date;
  projectId?: string;
  project: string;
}

function mapProduct(p: any): PropertyUnit {
  return {
    id: p.id,
    code: p.productCode || p.code || '',
    block: p.block || p.building || 'A',
    floor: p.floor ?? 1,
    area: p.area ?? 0,
    bedrooms: p.bedrooms ?? 2,
    direction: p.direction || 'Đông Nam',
    price: p.price ?? p.basePrice ?? 0,
    status: (p.status as UnitStatus) || 'AVAILABLE',
    bookedBy: p.bookedBy,
    lockedUntil: p.lockedUntil ? new Date(p.lockedUntil) : undefined,
    project: p.projectName || p.project || '',
    projectId: p.projectId,
  };
}

export function useInventoryData() {
  const selectedProject = useSalesStore(s => s.selectedProject);
  const setSelectedProject = useSalesStore(s => s.setSelectedProject);
  const queryClient = useQueryClient();

  // Fetch products from API
  const { data: rawProducts, isLoading } = useQuery({
    queryKey: ['products', selectedProject],
    queryFn: async () => {
      const res = await apiClient.get('/products', { params: { projectName: selectedProject } });
      return res.data;
    },
    staleTime: 30_000,
  });

  const units: PropertyUnit[] = useMemo(() => {
    const data = Array.isArray(rawProducts) ? rawProducts : [];
    return data.map(mapProduct);
  }, [rawProducts]);

  const stats = useMemo(() => ({
    available: units.filter(u => u.status === 'AVAILABLE').length,
    booked: units.filter(u => u.status === 'BOOKED' || u.status === 'LOCKED').length,
    deposit: units.filter(u => u.status === 'DEPOSIT' || u.status === 'PENDING_DEPOSIT').length,
    sold: units.filter(u => u.status === 'SOLD' || u.status === 'WAITING_CONTRACT' || u.status === 'COMPLETED').length,
    total: units.length,
  }), [units]);

  // Lock unit mutation
  const lockMutation = useMutation({
    mutationFn: async ({ unitId, bookedBy }: { unitId: string; bookedBy: string }) => {
      const res = await apiClient.post(`/products/${unitId}/lock`, { bookedBy, durationMinutes: 30 });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const lockUnit = useCallback((unitId: string, bookedBy: string) => {
    lockMutation.mutate({ unitId, bookedBy });
  }, [lockMutation]);

  // Request deposit mutation
  const depositMutation = useMutation({
    mutationFn: async ({ unitId, customerName, customerPhone }: { unitId: string; customerName: string; customerPhone: string }) => {
      const res = await apiClient.post(`/products/${unitId}/deposit`, { customerName, customerPhone });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const requestDeposit = useCallback((unitId: string, customerName: string, customerPhone: string) => {
    depositMutation.mutate({ unitId, customerName, customerPhone });
  }, [depositMutation]);

  return {
    units,
    selectedProject,
    setSelectedProject,
    stats,
    lockUnit,
    requestDeposit,
    isLoading,
  };
}
