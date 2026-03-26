/**
 * ResetPasswordModal — Extracted from UserManagementScreen
 * Uses SGModal, SGInput, SGButton, SGAlert
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SGModal } from '../../../../shared/ui/components/SGModal';
import { SGInput } from '../../../../shared/ui/components/SGInput';
import { SGButton } from '../../../../shared/ui/components/SGButton';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../../shared/theme/theme';
import { useResetPassword } from '../../hooks/useAdmin';
import { Key } from 'lucide-react-native';
import { showAlert } from '../../utils/adminUtils';

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export function ResetPasswordModal({ visible, onClose, userId, userName }: Props) {
  const { colors } = useAppTheme();
  const resetPassword = useResetPassword();
  const [newPassword, setNewPassword] = useState('');

  const handleClose = () => {
    setNewPassword('');
    onClose();
  };

  const handleReset = async () => {
    if (!newPassword || newPassword.length < 8) {
      showAlert('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    try {
      await resetPassword.mutateAsync({ id: userId, newPassword });
      setNewPassword('');
      showAlert('Đặt lại mật khẩu thành công!');
      onClose();
    } catch (e: any) {
      showAlert(e?.response?.data?.message || e?.message || 'Lỗi');
    }
  };

  return (
    <SGModal visible={visible} onClose={handleClose} title="Đặt lại mật khẩu" width={440}>
      {/* Warning banner */}
      <View style={[styles.warningBanner, {
        backgroundColor: `${colors.warning}10`,
        borderColor: `${colors.warning}25`,
      }]}>
        <Key size={16} color={colors.warning} />
        <Text style={[typography.small, { color: colors.textSecondary, flex: 1 }]}>
          Đặt lại mật khẩu cho <Text style={[typography.smallBold, { color: colors.text }]}>{userName}</Text>
        </Text>
      </View>

      <SGInput
        label="Mật khẩu mới (≥ 8 ký tự)"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Nhập mật khẩu mới..."
        secureTextEntry
      />

      <SGButton
        title="Đặt lại mật khẩu"
        onPress={handleReset}
        loading={resetPassword.isPending}
        disabled={resetPassword.isPending}
        icon={<Key size={16} color="#fff" />}
        fullWidth
        style={{ marginTop: spacing.lg }}
      />
    </SGModal>
  );
}

const styles = StyleSheet.create({
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderRadius: 12, borderWidth: 1,
    marginBottom: 16,
  },
});
