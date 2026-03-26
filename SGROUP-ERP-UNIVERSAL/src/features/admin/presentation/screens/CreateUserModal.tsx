/**
 * CreateUserModal — Extracted from UserManagementScreen
 * Uses SGModal, SGInput, SGChip, SGButton
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SGModal } from '../../../../shared/ui/components/SGModal';
import { SGInput } from '../../../../shared/ui/components/SGInput';
import { SGChip } from '../../../../shared/ui/components/SGChip';
import { SGButton } from '../../../../shared/ui/components/SGButton';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../../shared/theme/theme';
import { useCreateUser } from '../../hooks/useAdmin';
import { Plus } from 'lucide-react-native';
import { ROLE_OPTIONS, DEPT_OPTIONS } from '../../constants/adminConstants';
import { showAlert } from '../../utils/adminUtils';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CreateUserModal({ visible, onClose }: Props) {
  const { colors } = useAppTheme();
  const createUser = useCreateUser();

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee', department: '',
  });

  // Reset form when modal closes
  const resetForm = () => setForm({ name: '', email: '', password: '', role: 'employee', department: '' });

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      showAlert('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (!EMAIL_REGEX.test(form.email)) {
      showAlert('Email không hợp lệ');
      return;
    }
    if (form.password.length < 8) {
      showAlert('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    try {
      await createUser.mutateAsync(form);
      resetForm();
      showAlert('Tạo user thành công!');
      onClose();
    } catch (e: any) {
      showAlert(e?.response?.data?.message || e?.message || 'Lỗi');
    }
  };

  return (
    <SGModal visible={visible} onClose={handleClose} title="Tạo User mới" subtitle="Thêm tài khoản mới vào hệ thống">
      <View style={styles.formGap}>
        <SGInput
          label="Họ tên *"
          value={form.name}
          onChangeText={t => setForm(p => ({ ...p, name: t }))}
          placeholder="Nguyễn Văn A"
        />
        <SGInput
          label="Email *"
          value={form.email}
          onChangeText={t => setForm(p => ({ ...p, email: t }))}
          placeholder="user@sgroup.vn"
          keyboardType="email-address"
        />
        <SGInput
          label="Mật khẩu * (≥ 8 ký tự)"
          value={form.password}
          onChangeText={t => setForm(p => ({ ...p, password: t }))}
          placeholder="••••••••"
          secureTextEntry
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
                selected={form.role === r.value}
                onPress={() => setForm(p => ({ ...p, role: r.value }))}
              />
            ))}
          </View>
        </View>

        <View>
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: '700', marginBottom: 6 }]}>
            Phòng ban
          </Text>
          <View style={styles.chipRow}>
            {DEPT_OPTIONS.map(d => (
              <SGChip
                key={d}
                label={d}
                color={colors.accent}
                selected={form.department === d}
                onPress={() => setForm(p => ({ ...p, department: p.department === d ? '' : d }))}
              />
            ))}
          </View>
        </View>
      </View>

      <SGButton
        title="Tạo User"
        onPress={handleCreate}
        loading={createUser.isPending}
        disabled={createUser.isPending}
        icon={<Plus size={16} color="#fff" />}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />
    </SGModal>
  );
}

const styles = StyleSheet.create({
  formGap: { gap: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
