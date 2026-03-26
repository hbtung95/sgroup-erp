import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminApi } from '../../infrastructure/api/admin-api';

export const adminKeys = {
  all: ['admin'] as const,
  rbac: () => [...adminKeys.all, 'rbac'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  config: () => [...adminKeys.all, 'config'] as const,
  flags: () => [...adminKeys.all, 'flags'] as const,
  health: () => [...adminKeys.all, 'health'] as const,
  audit: () => [...adminKeys.all, 'audit'] as const,
  sessions: () => [...adminKeys.all, 'sessions'] as const,
};

// --- RBAC ---
export const useGetPermissionsMatrix = () => {
  return useQuery({
    queryKey: adminKeys.rbac(),
    queryFn: AdminApi.getPermissionsMatrix,
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ role, module, permission, updatedBy }: any) => AdminApi.updatePermission(role, module, permission, updatedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.rbac() });
    },
  });
};

// --- Users ---
export const useGetAllUsers = () => {
  return useQuery({
    queryKey: adminKeys.users(),
    queryFn: AdminApi.getAllUsers,
  });
};

export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: any) => AdminApi.toggleUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: any) => AdminApi.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
};

// --- Config & Flags ---
export const useGetSettings = () => {
  return useQuery({
    queryKey: adminKeys.config(),
    queryFn: AdminApi.getSettings,
  });
};

export const useGetFeatureFlags = () => {
  return useQuery({
    queryKey: adminKeys.flags(),
    queryFn: AdminApi.getFeatureFlags,
  });
};

export const useToggleFeatureFlag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, enabled, updatedBy }: any) => AdminApi.toggleFeatureFlag(key, enabled, updatedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.flags() });
    },
  });
};

// --- Health ---
export const useGetGlobalStats = () => {
  return useQuery({
    queryKey: [...adminKeys.health(), 'stats'],
    queryFn: AdminApi.getGlobalStats,
    refetchInterval: 30000, // Live radar every 30s
  });
};

export const useGetHealthCheck = () => {
  return useQuery({
    queryKey: [...adminKeys.health(), 'ping'],
    queryFn: AdminApi.getHealthCheck,
    refetchInterval: 60000,
  });
};

// --- Audit Logs ---
export const useGetAuditLogs = (limit: number = 50, page: number = 1) => {
  return useQuery({
    queryKey: [...adminKeys.audit(), 'logs', limit, page],
    queryFn: () => AdminApi.getAuditLogs(limit, page),
  });
};

export const useGetAuditAnalytics = (days: number = 30) => {
  return useQuery({
    queryKey: [...adminKeys.audit(), 'analytics', days],
    queryFn: () => AdminApi.getAuditAnalytics(days),
  });
};

// --- Security Sessions ---
export const useGetUserSessions = (userId: string) => {
  return useQuery({
    queryKey: [...adminKeys.sessions(), userId],
    queryFn: () => AdminApi.getUserSessions(userId),
    enabled: !!userId,
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => AdminApi.revokeSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.sessions() });
    },
  });
};

export const useRevokeAllUserSessions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => AdminApi.revokeAllUserSessions(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: [...adminKeys.sessions(), userId] });
    },
  });
};
