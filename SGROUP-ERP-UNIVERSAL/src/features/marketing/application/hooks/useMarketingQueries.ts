import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MarketingApi } from '../../infrastructure/api/marketing-api';

export const marketingKeys = {
  all: ['marketing'] as const,
  campaigns: () => [...marketingKeys.all, 'campaigns'] as const,
  leads: () => [...marketingKeys.all, 'leads'] as const,
  planning: () => [...marketingKeys.all, 'planning'] as const,
  content: () => [...marketingKeys.all, 'content'] as const,
  analytics: () => [...marketingKeys.all, 'analytics'] as const,
};

// --- Campaigns ---
export const useGetCampaigns = () => {
  return useQuery({
    queryKey: marketingKeys.campaigns(),
    queryFn: MarketingApi.getCampaigns,
  });
};

export const useGetCampaignById = (id: string) => {
  return useQuery({
    queryKey: [...marketingKeys.campaigns(), id],
    queryFn: () => MarketingApi.getCampaignById(id),
    enabled: !!id,
  });
};

// --- Leads ---
export const useGetLeads = () => {
  return useQuery({
    queryKey: marketingKeys.leads(),
    queryFn: MarketingApi.getLeads,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => MarketingApi.createLead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingKeys.leads() });
      queryClient.invalidateQueries({ queryKey: marketingKeys.campaigns() }); // Refresh campaign stats
    },
  });
};

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => MarketingApi.updateLeadStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketingKeys.leads() });
    },
  });
};

// --- Planning ---
export const useGetMasterPlan = (year: number, scenarioKey: string) => {
  return useQuery({
    queryKey: [...marketingKeys.planning(), year, scenarioKey],
    queryFn: () => MarketingApi.getMasterPlan(year, scenarioKey),
  });
};

export const useGetChannelBudgets = (planId: string) => {
  return useQuery({
    queryKey: [...marketingKeys.planning(), 'budgets', planId],
    queryFn: () => MarketingApi.getChannelBudgets(planId),
    enabled: !!planId,
  });
};

// --- Content ---
export const useGetContents = () => {
  return useQuery({
    queryKey: marketingKeys.content(),
    queryFn: MarketingApi.getContents,
  });
};

// --- Analytics ---
export const useGetChannelPerformance = (year?: number, month?: number) => {
  return useQuery({
    queryKey: [...marketingKeys.analytics(), year, month],
    queryFn: () => MarketingApi.getChannelPerformance(year, month),
  });
};
