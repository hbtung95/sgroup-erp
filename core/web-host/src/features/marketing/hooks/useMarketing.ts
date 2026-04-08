import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketingApi } from '../api/marketingApi';

// Dashboard
export function useMarketingDashboard() {
  return useQuery({
    queryKey: ['marketing', 'dashboard'],
    queryFn: marketingApi.getDashboard,
  });
}

// Campaigns
export function useCampaigns(params?: { status?: string; channel?: string }) {
  return useQuery({
    queryKey: ['marketing', 'campaigns', params],
    queryFn: () => marketingApi.getCampaigns(params),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => marketingApi.createCampaign(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing'] }),
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => marketingApi.updateCampaign(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing'] }),
  });
}

// Leads
export function useLeads(params?: { status?: string; source?: string; campaignId?: string }) {
  return useQuery({
    queryKey: ['marketing', 'leads', params],
    queryFn: () => marketingApi.getLeads(params),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => marketingApi.createLead(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing'] }),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => marketingApi.updateLead(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing'] }),
  });
}

// Content
export function useContent(params?: { status?: string; channel?: string }) {
  return useQuery({
    queryKey: ['marketing', 'content', params],
    queryFn: () => marketingApi.getContent(params),
  });
}

export function useCreateContent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => marketingApi.createContent(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['marketing'] }),
  });
}

// Channels
export function useChannels(params?: { year?: string; month?: string }) {
  return useQuery({
    queryKey: ['marketing', 'channels', params],
    queryFn: () => marketingApi.getChannels(params),
  });
}

// Budget
export function useBudget() {
  return useQuery({
    queryKey: ['marketing', 'budget'],
    queryFn: marketingApi.getBudget,
  });
}
