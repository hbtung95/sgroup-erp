/**
 * useCustomers — TanStack Query hook for Customer/Lead CRUD
 * Migrated from useState + salesApi to useQuery/useMutation + apiClient
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';

export type LeadStatus = 'NEW' | 'CONTACTED' | 'INTERESTED' | 'MEETING' | 'NEGOTIATION' | 'WON' | 'LOST';

export type Customer = {
  id: string;
  fullName: string;
  phone?: string;
  email?: string;
  source?: string;
  projectInterest?: string;
  budget?: string;
  status: LeadStatus;
  assignedTo?: string;
  assignedName?: string;
  isVip?: boolean;
  lastContactAt?: string;
  note?: string;
  year: number;
  month: number;
  createdAt: string;
  updatedAt: string;
};

const CUSTOMERS_KEY = 'customers';

export function useCustomers(filters?: Record<string, any>) {
  const qc = useQueryClient();

  const { data: customers = [], isLoading: loading, error } = useQuery({
    queryKey: [CUSTOMERS_KEY, filters],
    queryFn: async () => {
      const res = await apiClient.get('/customers', { params: filters });
      return res.data as Customer[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      const now = new Date();
      const res = await apiClient.post('/customers', {
        ...data,
        year: data.year || now.getFullYear(),
        month: data.month || now.getMonth() + 1,
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      const res = await apiClient.patch(`/customers/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/customers/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });

  return {
    customers,
    loading,
    error: error?.message || null,
    fetchCustomers: () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
    createCustomer: (data: Partial<Customer>) => createMutation.mutateAsync(data),
    updateCustomer: (id: string, data: Partial<Customer>) => updateMutation.mutateAsync({ id, data }),
    removeCustomer: (id: string) => removeMutation.mutateAsync(id),
  };
}
