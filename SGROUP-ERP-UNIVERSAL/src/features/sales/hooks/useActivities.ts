/**
 * useActivities — TanStack Query hook for SalesActivity daily log CRUD
 * Migrated from useState + salesApi to useQuery/useMutation + apiClient
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';

export type SalesActivityEntry = {
  id: string;
  date: string;
  staffId: string;
  staffName?: string;
  postsCount: number;
  callsCount: number;
  newLeads: number;
  meetingsMade: number;
  note?: string;
  year: number;
  month: number;
  createdAt: string;
};

const ACTIVITIES_KEY = 'activities';

export function useActivities(filters?: Record<string, any>) {
  const qc = useQueryClient();

  const { data: activities = [], isLoading: loading } = useQuery({
    queryKey: [ACTIVITIES_KEY, filters],
    queryFn: async () => {
      const res = await apiClient.get('/activities', { params: filters });
      return res.data as SalesActivityEntry[];
    },
  });

  const { data: summary = null } = useQuery({
    queryKey: [ACTIVITIES_KEY, 'summary', filters],
    queryFn: async () => {
      try {
        const res = await apiClient.get('/activities/summary', { params: filters });
        return res.data;
      } catch {
        // Compute from local activities
        const totals = activities.reduce(
          (acc, a) => ({
            postsCount: acc.postsCount + a.postsCount,
            callsCount: acc.callsCount + a.callsCount,
            newLeads: acc.newLeads + a.newLeads,
            meetingsMade: acc.meetingsMade + a.meetingsMade,
          }),
          { postsCount: 0, callsCount: 0, newLeads: 0, meetingsMade: 0 },
        );
        return { totalEntries: activities.length, ...totals };
      }
    },
    enabled: activities.length > 0,
  });

  const addMutation = useMutation({
    mutationFn: async (data: Omit<SalesActivityEntry, 'id' | 'createdAt'>) => {
      const res = await apiClient.post('/activities', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ACTIVITIES_KEY] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SalesActivityEntry> }) => {
      const res = await apiClient.patch(`/activities/${id}`, data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ACTIVITIES_KEY] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/activities/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ACTIVITIES_KEY] }),
  });

  return {
    activities,
    loading,
    summary,
    fetchActivities: () => qc.invalidateQueries({ queryKey: [ACTIVITIES_KEY] }),
    fetchSummary: () => qc.invalidateQueries({ queryKey: [ACTIVITIES_KEY, 'summary'] }),
    addActivity: (data: Omit<SalesActivityEntry, 'id' | 'createdAt'>) => addMutation.mutateAsync(data),
    updateActivity: (id: string, data: Partial<SalesActivityEntry>) => updateMutation.mutateAsync({ id, data }),
    deleteActivity: (id: string) => deleteMutation.mutateAsync(id),
  };
}
