/**
 * useTeams — TanStack Query hook for SalesTeam management + Staff
 * Migrated from useState + salesApi to useQuery/useMutation + apiClient
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/apiClient';

export type SalesTeamEntry = {
  id: string;
  code: string;
  name: string;
  leaderId?: string;
  leaderName?: string;
  region?: string;
  status: string;
  sortOrder: number;
};

export type SalesStaffEntry = {
  id: string;
  userId?: string;
  employeeCode?: string;
  fullName: string;
  phone?: string;
  email?: string;
  teamId?: string;
  role: string;
  status: string;
  leadsCapacity: number;
  personalTarget: number;
};

const TEAMS_KEY = 'salesTeams';
const STAFF_KEY = 'salesStaff';

export function useTeams() {
  const qc = useQueryClient();

  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: [TEAMS_KEY],
    queryFn: async () => {
      const res = await apiClient.get('/sales-ops/teams');
      // API returns { success, data, timestamp } — extract the array
      const raw = res.data?.data ?? res.data;
      return Array.isArray(raw) ? (raw as SalesTeamEntry[]) : [];
    },
  });

  const { data: staff = [], isLoading: loadingStaff } = useQuery({
    queryKey: [STAFF_KEY],
    queryFn: async () => {
      const res = await apiClient.get('/sales-ops/staff');
      // API returns { success, data, timestamp } — extract the array
      const raw = res.data?.data ?? res.data;
      return Array.isArray(raw) ? (raw as SalesStaffEntry[]) : [];
    },
  });

  const loading = loadingTeams || loadingStaff;

  const createTeamMutation = useMutation({
    mutationFn: async (data: Partial<SalesTeamEntry>) => {
      const res = await apiClient.post('/sales-ops/teams', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });

  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SalesTeamEntry> }) => {
      await apiClient.patch(`/sales-ops/teams/${id}`, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/sales-ops/teams/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [TEAMS_KEY] }),
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: Partial<SalesStaffEntry>) => {
      const res = await apiClient.post('/sales-ops/staff', data);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [STAFF_KEY] }),
  });

  const updateStaffMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SalesStaffEntry> }) => {
      await apiClient.patch(`/sales-ops/staff/${id}`, data);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [STAFF_KEY] }),
  });

  return {
    teams,
    staff,
    loading,
    fetchTeams: () => qc.invalidateQueries({ queryKey: [TEAMS_KEY] }),
    fetchStaff: () => qc.invalidateQueries({ queryKey: [STAFF_KEY] }),
    createTeam: (data: Partial<SalesTeamEntry>) => createTeamMutation.mutateAsync(data),
    updateTeam: (id: string, data: Partial<SalesTeamEntry>) => updateTeamMutation.mutateAsync({ id, data }),
    deleteTeam: (id: string) => deleteTeamMutation.mutateAsync(id),
    createStaff: (data: Partial<SalesStaffEntry>) => createStaffMutation.mutateAsync(data),
    updateStaff: (id: string, data: Partial<SalesStaffEntry>) => updateStaffMutation.mutateAsync({ id, data }),
  };
}
