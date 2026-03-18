/**
 * FeatureFlagsScreen — Premium feature flag management
 * Toggle modules + features on/off with audit trail
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Switch, Modal, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Flag, Plus, Trash2, Database, Power, X, Package, Shield, Bell, Globe,
} from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { typography, sgds, spacing, radius } from '../../../shared/theme/theme';
import { SGPageHeader } from '../../../shared/ui/components/SGPageHeader';
import { SGSection } from '../../../shared/ui/components/SGSection';
import { SGSkeleton } from '../../../shared/ui/components/SGSkeleton';
import { SGButton } from '../../../shared/ui/components/SGButton';
import { SGChip } from '../../../shared/ui/components/SGChip';
import { SGConfirmDialog } from '../../../shared/ui/components/SGConfirmDialog';
import { SGEmptyState } from '../../../shared/ui/components/SGEmptyState';
import {
  useFeatureFlags, useToggleFeatureFlag, useCreateFeatureFlag,
  useDeleteFeatureFlag, useSeedFeatureFlags,
} from '../hooks/useAdmin';
import { showToast } from '../utils/adminUtils';

const MODULE_ICONS: Record<string, any> = {
  hr: Package, sales: Package, finance: Package, project: Package, marketing: Package,
  general: Globe, security: Shield, notification: Bell,
};

const MODULE_COLORS: Record<string, string> = {
  hr: '#ec4899', sales: '#3b82f6', finance: '#10b981', project: '#8b5cf6', marketing: '#f59e0b',
  general: '#6366f1', security: '#ef4444', notification: '#14b8a6',
};

export function FeatureFlagsScreen() {
  const { colors } = useAppTheme();
  const [moduleFilter, setModuleFilter] = useState('');
  const [createVisible, setCreateVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [createForm, setCreateForm] = useState({ key: '', description: '', module: 'general' });

  const { data: flags, isLoading } = useFeatureFlags(moduleFilter || undefined);
  const toggleFlag = useToggleFeatureFlag();
  const createFlag = useCreateFeatureFlag();
  const deleteFlag = useDeleteFeatureFlag();
  const seedFlags = useSeedFeatureFlags();

  // Group flags by module — handle both array and { data: [...] } API shapes
  const flagsList: any[] = Array.isArray(flags) ? flags : Array.isArray((flags as any)?.data) ? (flags as any).data : [];
  const groupedFlags: Record<string, any[]> = {};
  flagsList.forEach((f: any) => {
    const mod = f.module || 'general';
    if (!groupedFlags[mod]) groupedFlags[mod] = [];
    groupedFlags[mod].push(f);
  });

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await toggleFlag.mutateAsync({ id, enabled });
      showToast(`Flag ${enabled ? 'bật' : 'tắt'} thành công`, 'success');
    } catch { showToast('Lỗi khi toggle flag', 'error'); }
  };

  const handleCreate = async () => {
    if (!createForm.key) return showToast('Key không được trống', 'warning');
    try {
      await createFlag.mutateAsync(createForm);
      showToast(`Tạo flag "${createForm.key}" thành công`, 'success');
      setCreateVisible(false);
      setCreateForm({ key: '', description: '', module: 'general' });
    } catch (e: any) { showToast(e?.response?.data?.message || 'Lỗi', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFlag.mutateAsync(deleteTarget.id);
      showToast(`Đã xóa flag "${deleteTarget.key}"`, 'success');
      setDeleteTarget(null);
    } catch { showToast('Lỗi khi xóa', 'error'); }
  };

  const handleSeed = async () => {
    try {
      const result = await seedFlags.mutateAsync();
      showToast(`Đã tạo ${result.created}/${result.total} feature flags mặc định`, 'success');
    } catch { showToast('Lỗi', 'error'); }
  };

  const modules = Object.keys(groupedFlags);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerPadding} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <SGPageHeader
            icon={<Flag size={24} color={colors.accent} />}
            iconColor={colors.accent}
            title="Feature Flags"
            subtitle="Bật/tắt tính năng hệ thống"
            rightContent={
              <View style={styles.headerActions}>
                <SGButton
                  title="Seed Defaults"
                  variant="secondary" size="sm"
                  icon={<Database size={16} />}
                  onPress={handleSeed}
                  loading={seedFlags.isPending}
                />
                <SGButton
                  title="Tạo Flag"
                  size="sm"
                  icon={<Plus size={16} color="#fff" />}
                  onPress={() => setCreateVisible(true)}
                />
              </View>
            }
          />
        </Animated.View>

        {/* Module filter */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.filterRow}>
          <SGChip label="Tất cả" selected={!moduleFilter} onPress={() => setModuleFilter('')} />
          {['general', 'security', 'notification', 'hr', 'sales', 'finance', 'project', 'marketing'].map(m => (
            <SGChip
              key={m}
              label={m}
              color={MODULE_COLORS[m]}
              selected={moduleFilter === m}
              onPress={() => setModuleFilter(moduleFilter === m ? '' : m)}
            />
          ))}
        </Animated.View>

        {/* Flags List */}
        {isLoading ? (
          <View style={{ gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <SGSkeleton key={i} width="100%" height={72} borderRadius={16} />
            ))}
          </View>
        ) : flagsList.length === 0 ? (
          <SGSection>
            <SGEmptyState
              icon={<Flag size={48} color={colors.textTertiary} strokeWidth={1} />}
              title="Chưa có feature flag nào"
              subtitle="Nhấn 'Seed Defaults' để tạo các flag mặc định"
              actionLabel="Seed Defaults"
              onAction={handleSeed}
            />
          </SGSection>
        ) : (
          modules.map((mod, mi) => {
            const IconComp = MODULE_ICONS[mod] || Globe;
            const modColor = MODULE_COLORS[mod] || colors.accent;
            const modFlags = groupedFlags[mod];

            return (
              <Animated.View
                key={mod}
                entering={FadeInDown.delay(150 + mi * 60).duration(400).springify()}
              >
                <SGSection
                  title={mod.toUpperCase()}
                  titleIcon={<IconComp size={16} color={modColor} />}
                  titleColor={modColor}
                  noPadding
                >
                  {modFlags.map((flag: any, fi: number) => (
                    <View
                      key={flag.id}
                      style={[styles.flagRow, {
                        borderBottomWidth: fi < modFlags.length - 1 ? 1 : 0,
                        borderBottomColor: colors.border,
                      }]}
                    >
                      <View style={styles.flagInfo}>
                        <View style={styles.flagKeyRow}>
                          <Power size={14} color={flag.enabled ? colors.success : colors.textDisabled} />
                          <Text style={[typography.bodyBold, { color: colors.text }]}>{flag.key}</Text>
                        </View>
                        {flag.description && (
                          <Text style={[typography.caption, { color: colors.textSecondary }]}>{flag.description}</Text>
                        )}
                        {flag.updatedBy && (
                          <Text style={[typography.caption, { color: colors.textDisabled, marginTop: 2 }]}>
                            Updated by: {flag.updatedBy}
                          </Text>
                        )}
                      </View>
                      <View style={styles.flagActions}>
                        <Switch
                          value={flag.enabled}
                          onValueChange={(v) => handleToggle(flag.id, v)}
                          trackColor={{ false: colors.bgCard, true: colors.success }}
                          thumbColor="#fff"
                        />
                        <Pressable
                          onPress={() => setDeleteTarget(flag)}
                          style={[styles.deleteBtn, { backgroundColor: `${colors.danger}10` }]}
                        >
                          <Trash2 size={14} color={colors.danger} />
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </SGSection>
              </Animated.View>
            );
          })
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={createVisible} transparent animationType="fade" onRequestClose={() => setCreateVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCreateVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.bgCard }]} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h4, { color: colors.text }]}>Tạo Feature Flag</Text>
              <Pressable onPress={() => setCreateVisible(false)} style={[styles.closeBtn, { backgroundColor: `${colors.danger}15` }]}>
                <X size={18} color={colors.danger} />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text style={[typography.label, { color: colors.textTertiary }]}>KEY</Text>
              <TextInput
                value={createForm.key}
                onChangeText={(t) => setCreateForm(p => ({ ...p, key: t }))}
                placeholder="feature.my_feature"
                placeholderTextColor={colors.textDisabled}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg }]}
              />
              <Text style={[typography.label, { color: colors.textTertiary, marginTop: 12 }]}>MÔ TẢ</Text>
              <TextInput
                value={createForm.description}
                onChangeText={(t) => setCreateForm(p => ({ ...p, description: t }))}
                placeholder="Mô tả tính năng..."
                placeholderTextColor={colors.textDisabled}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.bg }]}
              />
              <Text style={[typography.label, { color: colors.textTertiary, marginTop: 12 }]}>MODULE</Text>
              <View style={styles.moduleChips}>
                {['general', 'security', 'notification', 'hr', 'sales'].map(m => (
                  <SGChip key={m} label={m} color={MODULE_COLORS[m]} selected={createForm.module === m}
                    onPress={() => setCreateForm(p => ({ ...p, module: m }))} />
                ))}
              </View>
              <SGButton
                title="Tạo Flag"
                onPress={handleCreate}
                loading={createFlag.isPending}
                style={{ marginTop: 20 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirm */}
      <SGConfirmDialog
        visible={!!deleteTarget}
        title="Xóa Feature Flag"
        message={`Bạn có chắc muốn xóa flag "${deleteTarget?.key}"?\nHành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        variant="danger"
        loading={deleteFlag.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerPadding: { padding: spacing['2xl'] - 4, gap: spacing.lg, paddingBottom: 120 },
  headerActions: { flexDirection: 'row', gap: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  flagRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  flagInfo: { flex: 1 },
  flagKeyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  flagActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deleteBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', maxWidth: 480, borderRadius: 20, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  closeBtn: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  modalBody: { padding: 20, paddingTop: 0 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 14, marginTop: 6 },
  moduleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
});
