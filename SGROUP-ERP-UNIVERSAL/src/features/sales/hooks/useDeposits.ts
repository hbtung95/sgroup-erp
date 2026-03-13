/**
 * useDeposits — TanStack Query hook for deposit CRUD
 * Replaces Zustand store deposit operations with real API calls
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';

export interface DepositEntry {
  id: string;
  project: string;
  unitCode: string;
  customerName: string;
  customerPhone: string;
  depositAmount: number;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  staffName?: string;
  staffId?: string;
  paymentMethod?: string;
  receiptNo?: string;
  notes?: string;
}

// GET deposits
export const useGetDeposits = (params?: { year?: number; month?: number; status?: string; projectId?: string }) =>
  useQuery({
    queryKey: ['deposits', params],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/sales-ops/deposits', { params });
        const data = res.data;
        return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
      } catch {
        return [];
      }
    },
  });

// CREATE deposit
export const useCreateDeposit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<DepositEntry, 'id' | 'date' | 'status'>) => {
      const res = await apiClient.post('/sales-ops/deposits', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deposits'] }),
  });
};

// UPDATE deposit
export const useUpdateDeposit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DepositEntry> }) => {
      const res = await apiClient.patch(`/sales-ops/deposits/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deposits'] }),
  });
};

// CONFIRM deposit (Admin)
export const useConfirmDeposit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/sales-ops/deposits/${id}/confirm`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deposits'] }),
  });
};

// CANCEL deposit (Admin)
export const useCancelDeposit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/sales-ops/deposits/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deposits'] }),
  });
};
