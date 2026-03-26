/**
 * EditUserModal — Extracted from UserManagementScreen
 * Uses SGModal, SGInput, SGChip, SGButton, SGAvatar
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SGModal } from '../../../../shared/ui/components/SGModal';
import { SGInput } from '../../../../shared/ui/components/SGInput';
import { SGChip } from '../../../../shared/ui/components/SGChip';
import { SGButton } from '../../../../shared/ui/components/SGButton';
import { SGAvatar } from '../../../../shared/ui/components/SGAvatar';
import { SGConfirmDialog } from '../../../../shared/ui/components/SGConfirmDialog';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../../shared/theme/theme';
import { useUpdateUser } from '../../hooks/useAdmin';
import { Save } from 'lucide-react-native';
import { ROLE_OPTIONS, DEPT_OPTIONS, getRoleStyle } from '../../constants/adminConstants';
import { showAlert } from '../../utils/adminUtils';
import type { AdminUser } from '../../types/adminTypes';

interface Props {
  visible: boolean;
  onClose: () => void;
  user: AdminUser | null;
}

export function EditUserModal({ visible, onClose, user }: Props) {
  const { colors } = useAppTheme();
  const updateUser = useUpdateUser();

  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('');
  const [adminConfirm, setAdminConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditRole(user.role || 'employee');
      setEditDept(user.department || '');
    }
  }, [user]);

  const handleUpdate = async (force = false) => {
    if (!user) return;
    const data: any = {};
    if (editName !== user.name) data.name = editName;
    if (editRole !== user.role) data.role = editRole;
    if (editDept !== (user.department || '')) data.department = editDept || null;

    if (Object.keys(data).length === 0) {
      onClose();
      return;
    }

    if (!force && data.role === 'admin' && user.role !== 'admin') {
      setPendingData(data);
      setAdminConfirm(true);
      return;
    }

    try {
      await updateUser.mutateAsync({ id: user.id, data });
      showAlert('Cập nhật thành công!');
      onClose();
    } catch (e: any) {
      showAlert(e?.response?.data?.message || e?.message || 'Lỗi');
    }
  };

  const handleConfirmAdmin = async () => {
    setAdminConfirm(false);
    if (pendingData) {
      try {
        await updateUser.mutateAsync({ id: user!.id, data: pendingData });
        setPendingData(null);
        showAlert('Cấp quyền Admin thành công!');
        onClose();
      } catch (e: any) {
        showAlert(e?.response?.data?.message || e?.message || 'Lỗi');
      }
    }
  };

  if (!user) return null;

  return (
    <SGModal visible={visible} onClose={onClose} title="Chỉnh sửa User" subtitle="Cập nhật thông tin tài khoản">
      {/* User info header */}
      <View style={[styles.userHeader, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
        <SGAvatar name={user.name || '?'} size="sm" color={getRoleStyle(user.role).color} />
        <View style={styles.userHeaderInfo}>
          <Text style={[typography.smallBold, { color: colors.textSecondary }]}>{user.email}</Text>
          <Text style={[typography.caption, { color: colors.textTertiary }]}>ID: {user.id?.slice(0, 8)}...</Text>
        </View>
      </View>

      <View style={styles.formGap}>
        <SGInput
          label="Họ tên"
          value={editName}
          onChangeText={setEditName}
          placeholder="Nhập họ tên..."
        />

        <View>
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700', marginBottom: 6 }]}>
            Vai trò
          </Text>
          <View style={styles.chipRow}>
            {ROLE_OPTIONS.map(r => (
              <SGChip
                key={r.value}
                label={r.label}
                color={r.color}
                selected={editRole === r.value}
                onPress={() => setEditRole(r.value)}
              />
            ))}
          </View>
        </View>

        <View>
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700', marginBottom: 6 }]}>
            Phòng ban
          </Text>
          <View style={styles.chipRow}>
            <SGChip
              label="Không"
              color={colors.accent}
              selected={!editDept}
              onPress={() => setEditDept('')}
            />
            {DEPT_OPTIONS.map(d => (
              <SGChip
                key={d}
                label={d}
                color={colors.accent}
                selected={editDept === d}
                onPress={() => setEditDept(d)}
              />
            ))}
          </View>
        </View>
      </View>

      <SGButton
        title="Lưu thay đổi"
        onPress={handleUpdate}
        loading={updateUser.isPending}
        disabled={updateUser.isPending}
        icon={<Save size={16} color="#fff" />}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />

      <SGConfirmDialog
        visible={adminConfirm}
        title="Cấp quyền Admin"
        message={`Bạn sắp cấp quyền ADMIN cho ${user?.name}. Quyền này cho phép toàn quyền truy cập hệ thống. Tiếp tục?`}
        confirmLabel="Cấp quyền"
        variant="danger"
        loading={updateUser.isPending}
        onConfirm={handleConfirmAdmin}
        onCancel={() => { setAdminConfirm(false); setPendingData(null); }}
      />
    </SGModal>
  );
}

const styles = StyleSheet.create({
  userHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 20,
  },
  userHeaderInfo: { flex: 1 },
  formGap: { gap: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
