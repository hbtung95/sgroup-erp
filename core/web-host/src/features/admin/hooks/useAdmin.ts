/**
 * Admin React Query hooks — all admin data fetching & mutations (Tier 1 + Tier 2)
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); qc.invalidateQueries({ queryKey: ['admin', 'stats'] }); },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; role?: string; department?: string | null; salesRole?: string | null } }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); qc.invalidateQueries({ queryKey: ['admin', 'stats'] }); },
  });
}

export function useUpdateUserEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) => adminApi.updateUserEmail(id, email),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); qc.invalidateQueries({ queryKey: ['admin', 'stats'] }); },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) => adminApi.resetUserPassword(id, newPassword),
  });
}

export function useUnlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.unlockUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); qc.invalidateQueries({ queryKey: ['admin', 'stats'] }); },
  });
}

export function useBatchToggleUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, activate }: { ids: string[]; activate: boolean }) => adminApi.batchToggleUsers(ids, activate),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); qc.invalidateQueries({ queryKey: ['admin', 'stats'] }); },
  });
}

export function useBatchImportUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (csvContent: string) => adminApi.batchImportUsers(csvContent),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); qc.invalidateQueries({ queryKey: ['admin', 'stats'] }); },
  });
}

// ═══════════════════════════════════════════
// USER DETAIL & SESSIONS
// ═══════════════════════════════════════════

export function useUserDetail(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'user-detail', id],
    queryFn: () => adminApi.getUserDetail(id!),
    enabled: !!id,
    staleTime: 15_000,
  });
}

export function useUserSessions(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'user-sessions', userId],
    queryFn: () => adminApi.getUserSessions(userId!),
    enabled: !!userId,
    staleTime: 10_000,
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => adminApi.revokeSession(sessionId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'user-sessions'] }); qc.invalidateQueries({ queryKey: ['admin', 'user-detail'] }); },
  });
}

export function useRevokeAllSessions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => adminApi.revokeAllSessions(userId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'user-sessions'] }); qc.invalidateQueries({ queryKey: ['admin', 'user-detail'] }); },
  });
}

// ═══════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════

export function useAuditLogs(params: {
  action?: string; resource?: string; userName?: string; method?: string;
  dateFrom?: string; dateTo?: string; page?: number; limit?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => adminApi.getAuditLogs(params),
    staleTime: 10_000,
  });
}

export function useAuditLogDetail(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'audit-log-detail', id],
    queryFn: () => adminApi.getAuditLogDetail(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useAuditAnalytics(days?: number) {
  return useQuery({
    queryKey: ['admin', 'audit-analytics', days],
    queryFn: () => adminApi.getAuditAnalytics(days),
    staleTime: 60_000,
  });
}

// ═══════════════════════════════════════════
// PASSWORD EXPIRY & SUSPICIOUS ACTIVITY
// ═══════════════════════════════════════════

export function usePasswordExpiry() {
  return useQuery({
    queryKey: ['admin', 'password-expiry'],
    queryFn: adminApi.getPasswordExpiry,
    staleTime: 60_000,
  });
}

export function useSuspiciousActivity() {
  return useQuery({
    queryKey: ['admin', 'suspicious-activity'],
    queryFn: adminApi.getSuspiciousActivity,
    staleTime: 30_000,
    refetchInterval: 60_000,
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
    mutationFn: ({ key, value }: { key: string; value: string }) => adminApi.updateSetting(key, value),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'settings'] }); },
  });
}

export function useSeedSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.seedSettings(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'settings'] }); },
  });
}

export function useSettingHistory() {
  return useQuery({
    queryKey: ['admin', 'settings-history'],
    queryFn: adminApi.getSettingHistory,
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════

export function useFeatureFlags(module?: string) {
  return useQuery({
    queryKey: ['admin', 'feature-flags', module],
    queryFn: () => adminApi.getFeatureFlags(module),
    staleTime: 30_000,
  });
}

export function useToggleFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => adminApi.toggleFeatureFlag(id, enabled),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }); },
  });
}

export function useCreateFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { key: string; description?: string; module?: string; enabled?: boolean }) => adminApi.createFeatureFlag(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }); },
  });
}

export function useDeleteFeatureFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteFeatureFlag(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }); },
  });
}

export function useSeedFeatureFlags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.seedFeatureFlags(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] }); },
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
    mutationFn: (updates: { role: string; module: string; permission: string }[]) => adminApi.bulkUpdatePermissions(updates),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'permissions'] }); },
  });
}

export function useResetPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.resetPermissions(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'permissions'] }); },
  });
}

// ═══════════════════════════════════════════
// BACKUP & RESTORE
// ═══════════════════════════════════════════

export function useExportBackup() {
  return useMutation({
    mutationFn: () => adminApi.exportBackup(),
  });
}

export function useImportBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminApi.importBackup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      qc.invalidateQueries({ queryKey: ['admin', 'feature-flags'] });
      qc.invalidateQueries({ queryKey: ['admin', 'permissions'] });
    },
  });
}

// ═══════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════

export function useNotifications() {
  return useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: adminApi.getNotifications,
    staleTime: 10_000,
    refetchInterval: 15_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.markNotificationRead(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'notifications'] }); },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.markAllNotificationsRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'notifications'] }); },
  });
}

// ═══════════════════════════════════════════
// USER ACTIVITY TIMELINE
// ═══════════════════════════════════════════

export function useUserTimeline(userId: string | null, days?: number) {
  return useQuery({
    queryKey: ['admin', 'user-timeline', userId, days],
    queryFn: () => adminApi.getUserTimeline(userId!, days),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════════
// SCHEDULED TASKS
// ═══════════════════════════════════════════

export function useScheduledTasks() {
  return useQuery({
    queryKey: ['admin', 'scheduled-tasks'],
    queryFn: adminApi.getScheduledTasks,
    staleTime: 60_000,
  });
}

export function useTriggerTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => adminApi.triggerTask(name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'scheduled-tasks'] }); },
  });
}

// ═══════════════════════════════════════════
// CHANGELOG
// ═══════════════════════════════════════════

export function useChangelogs() {
  return useQuery({
    queryKey: ['admin', 'changelogs'],
    queryFn: adminApi.getChangelogs,
    staleTime: 60_000,
  });
}

export function useCreateChangelog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { version: string; title: string; description: string; type?: string; author?: string }) =>
      adminApi.createChangelog(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'changelogs'] }); },
  });
}

export function useDeleteChangelog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteChangelog(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'changelogs'] }); },
  });
}

// ═══════════════════════════════════════════
// COMMAND PALETTE
// ═══════════════════════════════════════════

export function useCommandSearch(query: string) {
  return useQuery({
    queryKey: ['admin', 'search', query],
    queryFn: () => adminApi.commandSearch(query),
    enabled: query.length >= 2,
    staleTime: 5_000,
  });
}

// ═══════════════════════════════════════════
// USER GROWTH
// ═══════════════════════════════════════════

export function useUserGrowth(days?: number) {
  return useQuery({
    queryKey: ['admin', 'user-growth', days],
    queryFn: () => adminApi.getUserGrowth(days),
    staleTime: 60_000,
  });
}

// ═══════════════════════════════════════════
// SECURITY SCORE
// ═══════════════════════════════════════════

export function useSecurityScore() {
  return useQuery({
    queryKey: ['admin', 'security-score'],
    queryFn: adminApi.getSecurityScore,
    staleTime: 30_000,
  });
}

// ═══════════════════════════════════════════
// LOGIN CALENDAR
// ═══════════════════════════════════════════

export function useLoginCalendar() {
  return useQuery({
    queryKey: ['admin', 'login-calendar'],
    queryFn: adminApi.getLoginCalendar,
    staleTime: 60_000,
  });
}
