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
      return Array.isArray(res.data) ? res.data as Customer[] : [];
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
    onMutate: async (newData) => {
      await qc.cancelQueries({ queryKey: [CUSTOMERS_KEY] });
      const previous = qc.getQueryData<Customer[]>([CUSTOMERS_KEY, filters]);
      const optimistic: Customer = {
        id: `temp-${Date.now()}`,
        fullName: newData.fullName || '',
        status: (newData.status as LeadStatus) || 'NEW',
        year: newData.year || new Date().getFullYear(),
        month: newData.month || new Date().getMonth() + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...newData,
      };
      qc.setQueryData<Customer[]>([CUSTOMERS_KEY, filters], (old = []) => [optimistic, ...old]);
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) qc.setQueryData([CUSTOMERS_KEY, filters], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      const res = await apiClient.patch(`/customers/${id}`, data);
      return res.data;
    },
    onMutate: async ({ id, data: updateData }) => {
      await qc.cancelQueries({ queryKey: [CUSTOMERS_KEY] });
      const previous = qc.getQueryData<Customer[]>([CUSTOMERS_KEY, filters]);
      qc.setQueryData<Customer[]>([CUSTOMERS_KEY, filters], (old = []) =>
        old.map(c => c.id === id ? { ...c, ...updateData } : c)
      );
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) qc.setQueryData([CUSTOMERS_KEY, filters], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/customers/${id}`);
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: [CUSTOMERS_KEY] });
      const previous = qc.getQueryData<Customer[]>([CUSTOMERS_KEY, filters]);
      qc.setQueryData<Customer[]>([CUSTOMERS_KEY, filters], (old = []) =>
        old.filter(c => c.id !== id)
      );
      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) qc.setQueryData([CUSTOMERS_KEY, filters], context.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }),
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
