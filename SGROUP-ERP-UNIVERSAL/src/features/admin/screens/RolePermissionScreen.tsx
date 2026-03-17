/**
 * RolePermissionScreen — Interactive RBAC permission matrix
 * Click on permission cells to cycle: full → write → read → none → full
 * Save all changes at once, or reset to defaults
 */
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Platform, ActivityIndicator, Alert } from 'react-native';
import {
  Shield, Check, X, Eye, Pencil, Info, Save, RotateCcw, Zap,
} from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { usePermissions, useBulkUpdatePermissions, useResetPermissions } from '../hooks/useAdmin';

// ═══════════════════════════════════════════
// Role & Permission definitions
// ═══════════════════════════════════════════
const ROLES = [
  { key: 'admin', label: 'Admin', color: '#ef4444', desc: 'Toàn quyền hệ thống' },
  { key: 'ceo', label: 'CEO', color: '#f59e0b', desc: 'Xem toàn bộ, quản lý chiến lược' },
  { key: 'hr', label: 'HR Manager', color: '#ec4899', desc: 'Quản lý nhân sự, lương, tuyển dụng' },
  { key: 'sales', label: 'Sales', color: '#3b82f6', desc: 'Bán hàng, chăm sóc KH' },
  { key: 'employee', label: 'Nhân viên', color: '#6366f1', desc: 'Quyền cơ bản' },
];

const MODULES = [
  { key: 'admin', label: 'Quản trị hệ thống' },
  { key: 'hr', label: 'Nhân sự' },
  { key: 'sales', label: 'Bán hàng' },
  { key: 'finance', label: 'Tài chính' },
  { key: 'project', label: 'Dự án' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'planning', label: 'Kế hoạch' },
  { key: 'reports', label: 'Báo cáo' },
];

type Permission = 'full' | 'write' | 'read' | 'none';
const PERM_CYCLE: Permission[] = ['full', 'write', 'read', 'none'];

// Default permission matrix (used when no DB data exists)
const DEFAULT_MATRIX: Record<string, Record<string, Permission>> = {
  admin:    { admin: 'full', hr: 'full', sales: 'full', finance: 'full', project: 'full', marketing: 'full', planning: 'full', reports: 'full' },
  ceo:      { admin: 'read', hr: 'read', sales: 'read', finance: 'full', project: 'full', marketing: 'read', planning: 'full', reports: 'full' },
  hr:       { admin: 'none', hr: 'full', sales: 'read', finance: 'read', project: 'read', marketing: 'none', planning: 'read', reports: 'read' },
  sales:    { admin: 'none', hr: 'none', sales: 'write', finance: 'none', project: 'read', marketing: 'read', planning: 'read', reports: 'read' },
  employee: { admin: 'none', hr: 'none', sales: 'none', finance: 'none', project: 'read', marketing: 'none', planning: 'read', reports: 'read' },
};

const PERM_CONFIG: Record<Permission, { icon: any; color: string; label: string; bg: string }> = {
  full:  { icon: Check, color: '#10b981', label: 'Toàn quyền', bg: 'rgba(16,185,129,0.12)' },
  write: { icon: Pencil, color: '#3b82f6', label: 'Đọc & Ghi', bg: 'rgba(59,130,246,0.12)' },
  read:  { icon: Eye, color: '#f59e0b', label: 'Chỉ đọc', bg: 'rgba(245,158,11,0.12)' },
  none:  { icon: X, color: '#94a3b8', label: 'Không có', bg: 'rgba(148,163,184,0.08)' },
};

export function RolePermissionScreen() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [localMatrix, setLocalMatrix] = useState<Record<string, Record<string, Permission>>>(DEFAULT_MATRIX);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalMatrix, setOriginalMatrix] = useState<Record<string, Record<string, Permission>>>(DEFAULT_MATRIX);
  const [changedCells, setChangedCells] = useState<Set<string>>(new Set());

  const { data: permData, isLoading } = usePermissions();
  const bulkUpdate = useBulkUpdatePermissions();
  const resetPerms = useResetPermissions();

  // Sync from API data
  useEffect(() => {
    if (!permData) return;

    let matrix: Record<string, Record<string, Permission>>;
    if (permData.isDefault) {
      // No permissions configured yet — use defaults
      matrix = permData.defaults || DEFAULT_MATRIX;
    } else if (permData.matrix) {
      matrix = permData.matrix as Record<string, Record<string, Permission>>;
    } else {
      matrix = DEFAULT_MATRIX;
    }

    // Ensure all roles and modules exist in matrix
    const complete: Record<string, Record<string, Permission>> = {};
    for (const role of ROLES) {
      complete[role.key] = {};
      for (const mod of MODULES) {
        complete[role.key][mod.key] = (matrix[role.key]?.[mod.key] as Permission) || 'none';
      }
    }

    setLocalMatrix(complete);
    setOriginalMatrix(JSON.parse(JSON.stringify(complete)));
    setHasChanges(false);
    setChangedCells(new Set());
  }, [permData]);

  // Click handler — cycle through permission levels
  const handleCellClick = (role: string, module: string) => {
    // Don't allow changing admin's admin permission (always full)
    if (role === 'admin' && module === 'admin') return;

    setLocalMatrix(prev => {
      const current = prev[role]?.[module] || 'none';
      const nextIdx = (PERM_CYCLE.indexOf(current as Permission) + 1) % PERM_CYCLE.length;
      const next = PERM_CYCLE[nextIdx];

      const newMatrix = { ...prev, [role]: { ...prev[role], [module]: next } };
      return newMatrix;
    });

    const cellKey = `${role}:${module}`;
    setChangedCells(prev => {
      const next = new Set(prev);
      // Check if the new value matches original
      const newPerm = PERM_CYCLE[(PERM_CYCLE.indexOf(localMatrix[role]?.[module] as Permission || 'none') + 1) % PERM_CYCLE.length];
      if (newPerm === originalMatrix[role]?.[module]) {
        next.delete(cellKey);
      } else {
        next.add(cellKey);
      }
      return next;
    });

    setHasChanges(true);
  };

  // Save all changes
  const handleSave = async () => {
    const updates: { role: string; module: string; permission: string }[] = [];
    for (const role of ROLES) {
      for (const mod of MODULES) {
        updates.push({
          role: role.key,
          module: mod.key,
          permission: localMatrix[role.key]?.[mod.key] || 'none',
        });
      }
    }

    try {
      await bulkUpdate.mutateAsync(updates);
      setHasChanges(false);
      setChangedCells(new Set());
      setOriginalMatrix(JSON.parse(JSON.stringify(localMatrix)));
      const msg = 'Đã lưu phân quyền thành công!';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Thành công', msg);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Lỗi khi lưu';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Lỗi', msg);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    if (Platform.OS === 'web') {
      if (!window.confirm('⚠️ Đặt lại TẤT CẢ quyền về mặc định?')) return;
    }
    try {
      await resetPerms.mutateAsync();
      setHasChanges(false);
      setChangedCells(new Set());
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Lỗi';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Lỗi', msg);
    }
  };

  // Count changes
  const changeCount = useMemo(() => {
    let count = 0;
    for (const role of ROLES) {
      for (const mod of MODULES) {
        if (localMatrix[role.key]?.[mod.key] !== originalMatrix[role.key]?.[mod.key]) count++;
      }
    }
    return count;
  }, [localMatrix, originalMatrix]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 120 }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 28, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={24} color="#6366f1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Phân quyền hệ thống</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Cấu hình quyền truy cập theo vai trò</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={handleReset}
              disabled={resetPerms.isPending}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12,
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                opacity: resetPerms.isPending ? 0.5 : 1,
              }}
            >
              <RotateCcw size={14} color={cSub} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>Đặt lại</Text>
            </Pressable>
            {changeCount > 0 && (
              <Pressable
                onPress={handleSave}
                disabled={bulkUpdate.isPending}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                  backgroundColor: '#6366f1',
                  opacity: bulkUpdate.isPending ? 0.5 : 1,
                  ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
                } as any}
              >
                <Save size={14} color="#fff" />
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>
                  {bulkUpdate.isPending ? 'Đang lưu...' : `Lưu (${changeCount})`}
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Info banner */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16,
          backgroundColor: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.06)',
          borderWidth: 1, borderColor: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.12)',
        }}>
          <Info size={18} color="#6366f1" />
          <Text style={{ flex: 1, fontSize: 13, fontWeight: '600', color: cSub, lineHeight: 20 }}>
            Nhấn vào ô quyền để chuyển đổi mức quyền. Thay đổi chỉ được lưu khi bấm "Lưu".
          </Text>
        </View>

        {/* Role Cards */}
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          {ROLES.map(role => {
            const isSelected = selectedRole === role.key;
            return (
              <Pressable
                key={role.key}
                onPress={() => setSelectedRole(isSelected ? null : role.key)}
                style={{
                  flex: 1, minWidth: 160, padding: 18, borderRadius: 18,
                  backgroundColor: isSelected ? `${role.color}15` : cardBg,
                  borderWidth: 2, borderColor: isSelected ? role.color : borderColor,
                  ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } : {}),
                } as any}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${role.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={16} color={role.color} />
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: isSelected ? role.color : cText }}>{role.label}</Text>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: cSub, lineHeight: 18 }}>{role.desc}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Permission Matrix */}
        <View style={{ borderRadius: 20, backgroundColor: cardBg, borderWidth: 1, borderColor, overflow: 'hidden' }}>
          {/* Table Header */}
          <View style={{
            flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: borderColor,
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc',
          }}>
            <Text style={{ width: 160, fontSize: 11, fontWeight: '800', color: cSub, textTransform: 'uppercase', letterSpacing: 1 }}>Module</Text>
            {(selectedRole ? ROLES.filter(r => r.key === selectedRole) : ROLES).map(role => (
              <View key={role.key} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: `${role.color}12` }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: role.color }}>{role.label}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Table Rows */}
          {MODULES.map((mod, i) => (
            <View key={mod.key} style={{
              flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
              borderBottomWidth: i < MODULES.length - 1 ? 1 : 0, borderBottomColor: borderColor,
            }}>
              <Text style={{ width: 160, fontSize: 13, fontWeight: '700', color: cText }}>{mod.label}</Text>
              {(selectedRole ? ROLES.filter(r => r.key === selectedRole) : ROLES).map(role => {
                const perm = (localMatrix[role.key]?.[mod.key] || 'none') as Permission;
                const config = PERM_CONFIG[perm];
                const IconComp = config.icon;
                const isLocked = role.key === 'admin' && mod.key === 'admin';
                const isChanged = localMatrix[role.key]?.[mod.key] !== originalMatrix[role.key]?.[mod.key];

                return (
                  <View key={role.key} style={{ flex: 1, alignItems: 'center' }}>
                    <Pressable
                      onPress={() => !isLocked && handleCellClick(role.key, mod.key)}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
                        backgroundColor: config.bg,
                        borderWidth: isChanged ? 2 : 0,
                        borderColor: isChanged ? '#6366f1' : 'transparent',
                        opacity: isLocked ? 0.6 : 1,
                        ...(Platform.OS === 'web' && !isLocked ? {
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        } : {}),
                      } as any}
                    >
                      <IconComp size={13} color={config.color} strokeWidth={2.5} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: config.color }}>{config.label}</Text>
                      {isChanged && <Zap size={9} color="#6366f1" />}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          {Object.entries(PERM_CONFIG).map(([key, config]) => {
            const IconComp = config.icon;
            return (
              <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: config.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp size={14} color={config.color} strokeWidth={2.5} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>{config.label}</Text>
              </View>
            );
          })}
          {/* Changed indicator */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 2, borderColor: '#6366f1', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={12} color="#6366f1" />
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#6366f1' }}>Đã thay đổi</Text>
          </View>
        </View>

        {/* Status bar */}
        {permData?.isDefault && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14,
            backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.15)',
          }}>
            <Info size={16} color="#f59e0b" />
            <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: cSub }}>
              Chưa cấu hình. Đang hiển thị quyền mặc định. Bấm <Text style={{ fontWeight: '800', color: '#6366f1' }}>Lưu</Text> để lưu vào cơ sở dữ liệu.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
