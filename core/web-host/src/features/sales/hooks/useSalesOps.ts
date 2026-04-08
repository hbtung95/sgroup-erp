import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SalesOpsAPI } from '../../../core/api/sales-ops.api';

// ── TEAMS ──
export const useGetTeams = (status?: string) =>
  useQuery({ queryKey: ['salesOps', 'teams', status], queryFn: () => SalesOpsAPI.getTeams(status) });

export const useCreateTeam = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: SalesOpsAPI.createTeam, onSuccess: () => qc.invalidateQueries({ queryKey: ['salesOps', 'teams'] }) });
};

export const useUpdateTeam = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => SalesOpsAPI.updateTeam(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['salesOps', 'teams'] }) });
};

export const useDeleteTeam = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: SalesOpsAPI.deleteTeam, onSuccess: () => qc.invalidateQueries({ queryKey: ['salesOps', 'teams'] }) });
};

// ── STAFF ──
export const useGetStaff = (params?: { teamId?: string; status?: string }) =>
  useQuery({ queryKey: ['salesOps', 'staff', params], queryFn: () => SalesOpsAPI.getStaff(params) });

export const useCreateStaff = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: SalesOpsAPI.createStaff, onSuccess: () => qc.invalidateQueries({ queryKey: ['salesOps', 'staff'] }) });
};

export const useUpdateStaff = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => SalesOpsAPI.updateStaff(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['salesOps', 'staff'] }) });
};

// ── PROJECTS ──
export const useGetProjects = (params?: { status?: string; type?: string }) =>
  useQuery({ queryKey: ['salesOps', 'projects', params], queryFn: () => SalesOpsAPI.getProjects(params) });

export const useCreateProject = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: SalesOpsAPI.createProject, onSuccess: () => qc.invalidateQueries({ queryKey: ['salesOps', 'projects'] }) });
};

export const useUpdateProject = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => SalesOpsAPI.updateProject(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['salesOps', 'projects'] }) });
};

// ── DEALS ──
export const useGetDeals = (params?: { year?: number; month?: number; teamId?: string; staffId?: string; stage?: string }) =>
  useQuery({ queryKey: ['salesOps', 'deals', params], queryFn: () => SalesOpsAPI.getDeals(params) });

export const useGetDealStats = (params: { year: number; month?: number; teamId?: string }) =>
  useQuery({ queryKey: ['salesOps', 'deals', 'stats', params], queryFn: () => SalesOpsAPI.getDealStats(params) });

export const useCreateDeal = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: SalesOpsAPI.createDeal, onSuccess: () => qc.invalidateQueries({ queryKey: ['salesOps', 'deals'] }) });
};

export const useUpdateDeal = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => SalesOpsAPI.updateDeal(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['salesOps', 'deals'] }) });
};

// ── TARGETS ──
export const useGetTargets = (params: { year: number; month?: number; teamId?: string; staffId?: string }) =>
  useQuery({ queryKey: ['salesOps', 'targets', params], queryFn: () => SalesOpsAPI.getTargets(params) });

export const useDistributeTargets = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: SalesOpsAPI.distributeTargets, onSuccess: () => qc.invalidateQueries({ queryKey: ['salesOps', 'targets'] }) });
};
