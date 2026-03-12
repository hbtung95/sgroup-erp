/**
 * useProducts — TanStack Query hook for PropertyProduct (Inventory) CRUD
 * Migrated from useState + salesApi to useQuery/useMutation + apiClient
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';

export type ProductStatus = 'AVAILABLE' | 'BOOKED' | 'LOCKED' | 'PENDING_DEPOSIT' | 'DEPOSIT' | 'SOLD' | 'COMPLETED';

export type PropertyProduct = {
  id: string;
  projectId: string;
  projectName?: string;
  code: string;
  block?: string;
  floor: number;
  area: number;
  price: number;
  direction?: string;
  bedrooms: number;
  status: ProductStatus;
  bookedBy?: string;
  lockedUntil?: string;
  customerPhone?: string;
  note?: string;
};

const PRODUCTS_KEY = 'products';

export function useProducts(filters?: Record<string, any>) {
  const qc = useQueryClient();

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: [PRODUCTS_KEY, filters],
    queryFn: async () => {
      const res = await apiClient.get('/products', { params: filters });
      return res.data as PropertyProduct[];
    },
  });

  const { data: stats = null } = useQuery({
    queryKey: [PRODUCTS_KEY, 'stats', filters],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/products/stats', { params: filters });
        return res.data;
      } catch {
        const byStatus = products.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        return { total: products.length, byStatus };
      }
    },
    enabled: products.length > 0,
  });

  const lockMutation = useMutation({
    mutationFn: async ({ id, bookedBy, durationMinutes }: { id: string; bookedBy: string; durationMinutes?: number }) => {
      const res = await apiClient.post(`/products/${id}/lock`, { bookedBy, durationMinutes });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });

  const depositMutation = useMutation({
    mutationFn: async ({ id, customerName, customerPhone }: { id: string; customerName: string; customerPhone: string }) => {
      const res = await apiClient.post(`/products/${id}/deposit`, { customerName, customerPhone });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/products/${id}/approve`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/products/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });

  return {
    products,
    loading,
    stats,
    fetchProducts: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
    fetchStats: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY, 'stats'] }),
    lockUnit: (id: string, bookedBy: string, durationMinutes?: number) => lockMutation.mutateAsync({ id, bookedBy, durationMinutes }),
    requestDeposit: (id: string, customerName: string, customerPhone: string) => depositMutation.mutateAsync({ id, customerName, customerPhone }),
    approveDeposit: (id: string) => approveMutation.mutateAsync(id),
    cancelBooking: (id: string) => cancelMutation.mutateAsync(id),
  };
}
