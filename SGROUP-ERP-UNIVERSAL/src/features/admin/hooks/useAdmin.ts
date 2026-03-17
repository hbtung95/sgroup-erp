/**
 * Admin React Query hooks — all admin data fetching & mutations
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../api/adminApi';

// ═══════════════════════════════════════════
// DASHBOARD & HEALTH
// ═══════════════════════════════════════════

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getAdminStats,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useAdminHealth() {
  return useQuery({
    queryKey: ['admin', 'health'],
    queryFn: adminApi.getAdminHealth,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

// ═══════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════

export function useAdminUsers(params: { search?: string; role?: string; status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.getAdminUsers(params),
    staleTime: 15_000,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; role?: string; department?: string }) =>
      adminApi.createUser(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; role?: string; department?: string } }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      adminApi.resetUserPassword(id, newPassword),
  });
}

// ═══════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════

export function useAuditLogs(params: { action?: string; resource?: string; userName?: string; method?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => adminApi.getAuditLogs(params),
    staleTime: 10_000,
  });
}

// ═══════════════════════════════════════════
// SYSTEM SETTINGS
// ═══════════════════════════════════════════

export function useSystemSettings(group?: string) {
  return useQuery({
    queryKey: ['admin', 'settings', group],
    queryFn: () => adminApi.getSettings(group),
    staleTime: 30_000,
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      adminApi.updateSetting(key, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

export function useSeedSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.seedSettings(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });
}

// ═══════════════════════════════════════════
// ROLE PERMISSIONS
// ═══════════════════════════════════════════

export function usePermissions() {
  return useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: adminApi.getPermissions,
    staleTime: 30_000,
  });
}

export function useBulkUpdatePermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: { role: string; module: string; permission: string }[]) =>
      adminApi.bulkUpdatePermissions(updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'permissions'] });
    },
  });
}

export function useResetPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.resetPermissions(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'permissions'] });
    },
  });
}
