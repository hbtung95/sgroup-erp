import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AgencyApi } from '../../infrastructure/api/agency-api';

export const agencyKeys = {
  all: ['agency'] as const,
  overview: () => [...agencyKeys.all, 'overview'] as const,
  list: () => [...agencyKeys.all, 'list'] as const,
};

export const useGetAgencyOverview = () => {
  return useQuery({
    queryKey: agencyKeys.overview(),
    queryFn: AgencyApi.getOverview,
    refetchInterval: 60000, 
  });
};

export const useGetAllAgencies = () => {
  return useQuery({
    queryKey: agencyKeys.list(),
    queryFn: AgencyApi.getAllAgencies,
  });
};

export const useCreateAgency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AgencyApi.createAgency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agencyKeys.list() });
      queryClient.invalidateQueries({ queryKey: agencyKeys.overview() });
    },
  });
};

export const useProcessCommission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: { amount: number, referenceId: string } }) => 
      AgencyApi.processCommission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agencyKeys.list() });
      queryClient.invalidateQueries({ queryKey: agencyKeys.overview() });
    },
  });
};
