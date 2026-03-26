import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SalesApi } from '../../infrastructure/api/sales-api';

export const salesKeys = {
  all: ['sales'] as const,
  customers: () => [...salesKeys.all, 'customers'] as const,
  activities: () => [...salesKeys.all, 'activities'] as const,
  appointments: () => [...salesKeys.all, 'appointments'] as const,
};

export const useGetCustomers = (filters?: { status?: string }) => {
  return useQuery({
    queryKey: [...salesKeys.customers(), filters],
    queryFn: () => SalesApi.getCustomers(filters),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, staffId }: { data: any, staffId: string }) => 
      SalesApi.createCustomer(data, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.customers() });
    },
  });
};

export const useGetActivities = () => {
  return useQuery({
    queryKey: salesKeys.activities(),
    queryFn: SalesApi.getActivities,
  });
};

export const useGetAppointments = () => {
  return useQuery({
    queryKey: salesKeys.appointments(),
    queryFn: SalesApi.getAppointments,
  });
};
