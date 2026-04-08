/**
 * useDeals — TanStack Query hook for FactDeal pipeline
 * Migrated from useState + salesApi to useQuery/useMutation + apiClient
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';

export type DealStage = 'LEAD' | 'MEETING' | 'BOOKING' | 'DEPOSIT' | 'CONTRACT' | 'COMPLETED' | 'CANCELLED';

export type Deal = {
  id: string;
  dealCode?: string;
  projectId?: string;
  projectName?: string;
  staffId?: string;
  staffName?: string;
  teamId?: string;
  teamName?: string;
  customerName?: string;
  customerPhone?: string;
  productCode?: string;
  productType?: string;
  dealValue: number;
  feeRate: number;
  commission: number;
  stage: DealStage;
  dealDate?: string;
  bookingDate?: string;
  contractDate?: string;
  source?: string;
  note?: string;
  year: number;
  month: number;
  status: string;
  createdAt: string;
};

const DEALS_KEY = 'deals';

export function useDeals(filters?: Record<string, any>) {
  const qc = useQueryClient();

  const { data: deals = [], isLoading: loading } = useQuery({
    queryKey: [DEALS_KEY, filters],
    queryFn: async () => {
      const res = await apiClient.get('/sales-ops/deals', { params: filters });
      const data = res.data;
      return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []) as Deal[];
    },
  });

  const { data: stats = null } = useQuery({
    queryKey: [DEALS_KEY, 'stats', filters],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/sales-ops/deals/stats', { params: filters });
        return res.data;
      } catch {
        const byStage = deals.reduce((acc, d) => {
          acc[d.stage] = (acc[d.stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        return {
          total: deals.length,
          totalGMV: deals.reduce((s, d) => s + d.dealValue, 0),
          totalRevenue: deals.reduce((s, d) => s + d.commission, 0),
          byStage,
        };
      }
    },
    enabled: deals.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Deal>) => {
      const res = await apiClient.post('/sales-ops/deals', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEALS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Deal> }) => {
      const res = await apiClient.patch(`/sales-ops/deals/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEALS_KEY] }),
  });

  return {
    deals,
    loading,
    stats,
    fetchDeals: () => qc.invalidateQueries({ queryKey: [DEALS_KEY] }),
    fetchStats: () => qc.invalidateQueries({ queryKey: [DEALS_KEY, 'stats'] }),
    createDeal: (data: Partial<Deal>) => createMutation.mutateAsync(data),
    updateDeal: (id: string, data: Partial<Deal>) => updateMutation.mutateAsync({ id, data }),
  };
}
