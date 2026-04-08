/**
 * Admin API client — All endpoints for the Admin module (Tier 1 + Tier 2)
 */
import { apiClient } from '../../../core/api/apiClient';

// ═══════════════════════════════════════════
// DASHBOARD & HEALTH
// ═══════════════════════════════════════════

export const getAdminStats = async () => {
  const { data } = await apiClient.get('/admin/stats');
  return data;
};

export const getAdminHealth = async () => {
  const { data } = await apiClient.get('/admin/health');
  return data;
};

// ═══════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════

export const getAdminUsers = async (params: {
  search?: string; role?: string; status?: string; page?: number; limit?: number;
}) => {
  const { data } = await apiClient.get('/admin/users', { params });
  return data;
};

export const createUser = async (body: {
  name: string; email: string; password: string; role?: string; department?: string;
}) => {
  const { data } = await apiClient.post('/admin/users', body);
  return data;
};

export const updateUser = async (id: string, body: {
  name?: string; role?: string; department?: string | null; salesRole?: string | null;
}) => {
  const { data } = await apiClient.patch(`/admin/users/${id}`, body);
  return data;
};

export const updateUserEmail = async (id: string, email: string) => {
  const { data } = await apiClient.patch(`/admin/users/${id}/email`, { email });
  return data;
};

export const deactivateUser = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/users/${id}`);
  return data;
};

export const resetUserPassword = async (id: string, newPassword: string) => {
  const { data } = await apiClient.post(`/admin/users/${id}/reset-password`, { newPassword });
  return data;
};

export const unlockUser = async (id: string) => {
  const { data } = await apiClient.post(`/admin/users/${id}/unlock`);
  return data;
};

export const batchToggleUsers = async (ids: string[], activate: boolean) => {
  const { data } = await apiClient.post('/admin/users/batch-toggle', { ids, activate });
  return data;
};

export const exportUsersCSV = async (params?: { role?: string; status?: string }) => {
  const { data } = await apiClient.get('/admin/users/export', { params, responseType: 'text' as any });
  return data;
};

export const batchImportUsers = async (csvContent: string) => {
  const { data } = await apiClient.post('/admin/users/import', { csvContent });
  return data;
};

// ═══════════════════════════════════════════
// USER DETAIL & SESSIONS
// ═══════════════════════════════════════════

export const getUserDetail = async (id: string) => {
  const { data } = await apiClient.get(`/admin/users/${id}/detail`);
  return data;
};

export const getUserSessions = async (id: string) => {
  const { data } = await apiClient.get(`/admin/users/${id}/sessions`);
  return data;
};

export const revokeSession = async (sessionId: string) => {
  const { data } = await apiClient.delete(`/admin/sessions/${sessionId}`);
  return data;
};

export const revokeAllSessions = async (userId: string) => {
  const { data } = await apiClient.delete(`/admin/users/${userId}/sessions`);
  return data;
};

// ═══════════════════════════════════════════
// AUDIT LOGS
// ═══════════════════════════════════════════

export const getAuditLogs = async (params: {
  action?: string; resource?: string; userName?: string; method?: string;
  dateFrom?: string; dateTo?: string; page?: number; limit?: number;
}) => {
  const { data } = await apiClient.get('/admin/audit-logs', { params });
  return data;
};

export const getAuditLogDetail = async (id: string) => {
  const { data } = await apiClient.get(`/admin/audit-logs/${id}`);
  return data;
};

export const getAuditAnalytics = async (days?: number) => {
  const { data } = await apiClient.get('/admin/audit-analytics', { params: days ? { days } : {} });
  return data;
};

// ═══════════════════════════════════════════
// PASSWORD EXPIRY & SUSPICIOUS ACTIVITY
// ═══════════════════════════════════════════

export const getPasswordExpiry = async () => {
  const { data } = await apiClient.get('/admin/password-expiry');
  return data;
};

export const getSuspiciousActivity = async () => {
  const { data } = await apiClient.get('/admin/suspicious-activity');
  return data;
};

// ═══════════════════════════════════════════
// SYSTEM SETTINGS
// ═══════════════════════════════════════════

export const getSettings = async (group?: string) => {
  const { data } = await apiClient.get('/admin/settings', { params: group ? { group } : {} });
  return data;
};

export const updateSetting = async (key: string, value: string) => {
  const { data } = await apiClient.patch(`/admin/settings/${key}`, { value });
  return data;
};

export const createSetting = async (body: {
  key: string; value: string; group?: string; label?: string; description?: string; valueType?: string;
}) => {
  const { data } = await apiClient.post('/admin/settings', body);
  return data;
};

export const seedSettings = async () => {
  const { data } = await apiClient.post('/admin/settings/seed');
  return data;
};

export const getSettingHistory = async () => {
  const { data } = await apiClient.get('/admin/settings/history');
  return data;
};

// ═══════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════

export const getFeatureFlags = async (module?: string) => {
  const { data } = await apiClient.get('/admin/feature-flags', { params: module ? { module } : {} });
  return data;
};

export const toggleFeatureFlag = async (id: string, enabled: boolean) => {
  const { data } = await apiClient.patch(`/admin/feature-flags/${id}`, { enabled });
  return data;
};

export const createFeatureFlag = async (body: { key: string; description?: string; module?: string; enabled?: boolean }) => {
  const { data } = await apiClient.post('/admin/feature-flags', body);
  return data;
};

export const deleteFeatureFlag = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/feature-flags/${id}`);
  return data;
};

export const seedFeatureFlags = async () => {
  const { data } = await apiClient.post('/admin/feature-flags/seed');
  return data;
};

// ═══════════════════════════════════════════
// ROLE PERMISSIONS
// ═══════════════════════════════════════════

export const getPermissions = async () => {
  const { data } = await apiClient.get('/admin/permissions');
  return data;
};

export const updatePermission = async (role: string, module: string, permission: string) => {
  const { data } = await apiClient.patch('/admin/permissions', { role, module, permission });
  return data;
};

export const bulkUpdatePermissions = async (updates: { role: string; module: string; permission: string }[]) => {
  const { data } = await apiClient.post('/admin/permissions/bulk', { updates });
  return data;
};

export const resetPermissions = async () => {
  const { data } = await apiClient.post('/admin/permissions/reset');
  return data;
};

// ═══════════════════════════════════════════
// BACKUP & RESTORE
// ═══════════════════════════════════════════

export const exportBackup = async () => {
  const { data } = await apiClient.get('/admin/backup');
  return data;
};

export const importBackup = async (backupData: any) => {
  const { data } = await apiClient.post('/admin/restore', backupData);
  return data;
};

// ═══════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════

export const getNotifications = async () => {
  const { data } = await apiClient.get('/admin/notifications');
  return data;
};

export const markNotificationRead = async (id: string) => {
  const { data } = await apiClient.patch(`/admin/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await apiClient.post('/admin/notifications/read-all');
  return data;
};

// ═══════════════════════════════════════════
// USER ACTIVITY TIMELINE
// ═══════════════════════════════════════════

export const getUserTimeline = async (id: string, days?: number) => {
  const { data } = await apiClient.get(`/admin/users/${id}/timeline`, { params: days ? { days } : {} });
  return data;
};

// ═══════════════════════════════════════════
// SCHEDULED TASKS
// ═══════════════════════════════════════════

export const getScheduledTasks = async () => {
  const { data } = await apiClient.get('/admin/scheduled-tasks');
  return data;
};

export const triggerTask = async (name: string) => {
  const { data } = await apiClient.post(`/admin/scheduled-tasks/${name}/trigger`);
  return data;
};

// ═══════════════════════════════════════════
// CHANGELOG
// ═══════════════════════════════════════════

export const getChangelogs = async () => {
  const { data } = await apiClient.get('/admin/changelogs');
  return data;
};

export const createChangelog = async (body: { version: string; title: string; description: string; type?: string; author?: string }) => {
  const { data } = await apiClient.post('/admin/changelogs', body);
  return data;
};

export const deleteChangelog = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/changelogs/${id}`);
  return data;
};

// ═══════════════════════════════════════════
// COMMAND PALETTE
// ═══════════════════════════════════════════

export const commandSearch = async (q: string) => {
  const { data } = await apiClient.get('/admin/search', { params: { q } });
  return data;
};

// ═══════════════════════════════════════════
// USER GROWTH
// ═══════════════════════════════════════════

export const getUserGrowth = async (days?: number) => {
  const { data } = await apiClient.get('/admin/user-growth', { params: days ? { days } : {} });
  return data;
};

// ═══════════════════════════════════════════
// SECURITY SCORE
// ═══════════════════════════════════════════

export const getSecurityScore = async () => {
  const { data } = await apiClient.get('/admin/security-score');
  return data;
};

// ═══════════════════════════════════════════
// LOGIN CALENDAR
// ═══════════════════════════════════════════

export const getLoginCalendar = async () => {
  const { data } = await apiClient.get('/admin/login-calendar');
  return data;
};
