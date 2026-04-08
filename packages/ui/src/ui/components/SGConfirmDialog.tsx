import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AlertTriangle, Info } from 'lucide-react-native';
import { SGModal } from './SGModal';
import { SGButton } from './SGButton';
import { useTheme, typography } from '../../theme/theme';

interface Props {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
  style?: ViewStyle;
}

export function SGConfirmDialog({
  visible, onConfirm, onCancel, title, message,
  confirmLabel = 'Xác nhận', cancelLabel = 'Hủy', variant = 'default', loading, style,
}: Props) {
  const c = useTheme();
  const isDanger = variant === 'danger';
  const clr = isDanger ? c.danger : c.brand;
  const Icon = isDanger ? AlertTriangle : Info;

  return (
    <SGModal visible={visible} onClose={onCancel} width={440}>
      <View style={[styles.body, style]}>
        <View style={[styles.iconCircle, { backgroundColor: `${clr}12`, borderColor: `${clr}20` }]}>
          <Icon size={28} color={clr} strokeWidth={2} />
        </View>
        <Text style={[typography.h3, { color: c.text, textAlign: 'center' }]}>{title}</Text>
        {message && <Text style={[typography.body, { color: c.textSecondary, textAlign: 'center', maxWidth: 340 }]}>{message}</Text>}
        <View style={styles.actions}>
          <SGButton title={cancelLabel} variant="secondary" onPress={onCancel} disabled={loading} style={{ flex: 1 }} />
          <SGButton title={confirmLabel} variant={isDanger ? 'outline' : 'primary'} onPress={onConfirm} loading={loading} disabled={loading} style={{ flex: 1 }} />
        </View>
      </View>
    </SGModal>
  );
}

const styles = StyleSheet.create({
  body: { alignItems: 'center', gap: 12 },
  iconCircle: { width: 64, height: 64, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  actions: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 12 },
});
