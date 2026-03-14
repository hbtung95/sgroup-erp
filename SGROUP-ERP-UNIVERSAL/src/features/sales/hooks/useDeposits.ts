import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';

export interface DepositEntry {
  id: string;
  project: string;
  projectId?: string | null;
  projectName?: string;
  unitCode: string;
  customerName: string;
  customerPhone: string;
  depositAmount: number;
  date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';
  staffName?: string | null;
  staffId?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  paymentMethod?: string | null;
  receiptNo?: string | null;
  notes?: string | null;
  createdByName?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: string | null;
}

export type DepositPayload = {
  project: string;
  projectId?: string;
  unitCode: string;
  customerName: string;
  customerPhone: string;
  depositAmount: number;
  paymentMethod?: string;
  receiptNo?: string;
  notes?: string;
};

type DepositUpdatePayload = Partial<DepositPayload> & {
  status?: DepositEntry['status'];
};

function normalizeListResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    Array.isArray((payload as { data?: unknown }).data)
  ) {
    return (payload as { data: T[] }).data;
  }

  return [];
}

export const useGetDeposits = (params?: {
  year?: number;
  month?: number;
  status?: string;
  projectId?: string;
}) =>
  useQuery({
    queryKey: ['deposits', params],
    queryFn: async () => {
      const res = await apiClient.get('/sales-ops/deposits', { params });
      return normalizeListResponse<DepositEntry>(res.data);
    },
  });

export const useCreateDeposit = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: DepositPayload) => {
      const res = await apiClient.post('/sales-ops/deposits', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deposits'] }),
  });
};

export const useUpdateDeposit = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: DepositUpdatePayload }) => {
      const res = await apiClient.patch(`/sales-ops/deposits/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deposits'] }),
  });
};

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
