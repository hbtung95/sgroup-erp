import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { CheckCircle2, AlertCircle, XCircle, Info, Clock, Minus } from 'lucide-react-native';
import { useTheme, typography } from '../../theme/theme';

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'pending' | 'neutral';

interface Props {
  status: StatusType;
  text?: string;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const CFG: Record<StatusType, { iconComp: any }> = {
  success: { iconComp: CheckCircle2 },
  warning: { iconComp: AlertCircle },
  danger: { iconComp: XCircle },
  info: { iconComp: Info },
  pending: { iconComp: Clock },
  neutral: { iconComp: Minus },
};

const LABELS: Record<StatusType, string> = {
  success: 'Hoàn thành', warning: 'Cảnh báo', danger: 'Lỗi', info: 'Thông tin', pending: 'Đang xử lý', neutral: 'Nháp',
};

export function SGStatusBadge({ status, text, size = 'md', style }: Props) {
  const c = useTheme();
  const color = status === 'success' ? c.success : status === 'warning' ? c.warning : status === 'danger' ? c.danger
    : status === 'info' ? c.info : status === 'pending' ? c.accent : c.textTertiary;
  const bg = status === 'success' ? c.successBg : status === 'warning' ? c.warningBg : status === 'danger' ? c.dangerBg
    : status === 'info' ? c.infoBg : status === 'pending' ? c.accentBg : c.bgTertiary;
  const Icon = CFG[status].iconComp;
  const isSm = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bg, paddingHorizontal: isSm ? 8 : 10, paddingVertical: isSm ? 3 : 5 }, style]}>
      <Icon size={isSm ? 12 : 14} color={color} strokeWidth={2.5} />
      <Text style={[isSm ? typography.caption : typography.smallBold, { color }]}>{text || LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, alignSelf: 'flex-start' },
});
