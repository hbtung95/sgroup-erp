import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, Platform } from 'react-native';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface Props {
  variant?: AlertVariant;
  title?: string;
  message: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: { label: string; onPress: () => void };
  style?: ViewStyle;
}

const CFG: Record<AlertVariant, { icon: any; clr: string }> = {
  info: { icon: Info, clr: '#3b82f6' },
  success: { icon: CheckCircle2, clr: '#22c55e' },
  warning: { icon: AlertTriangle, clr: '#f59e0b' },
  error: { icon: AlertCircle, clr: '#ef4444' },
};

export function SGAlert({ variant = 'info', title, message, icon, dismissible, onDismiss, action, style }: Props) {
  const c = useTheme();
  const cfg = CFG[variant];
  const Icon = cfg.icon;

  return (
    <View style={[styles.alert, {
      backgroundColor: `${cfg.clr}08`,
      borderColor: `${cfg.clr}25`,
      borderLeftColor: cfg.clr,
    }, style]}>
      <View style={[styles.iconBox, { backgroundColor: `${cfg.clr}15` }]}>
        {icon || <Icon size={18} color={cfg.clr} strokeWidth={2.5} />}
      </View>
      <View style={{ flex: 1 }}>
        {title && <Text style={[typography.bodyBold, { color: c.text, marginBottom: 2 }]}>{title}</Text>}
        <Text style={[typography.small, { color: c.textSecondary, lineHeight: 20 }]}>{message}</Text>
        {action && (
          <Pressable onPress={action.onPress} style={[styles.action, Platform.OS === 'web' && (sgds.cursor as any)]}>
            <Text style={[typography.smallBold, { color: cfg.clr }]}>{action.label}</Text>
          </Pressable>
        )}
      </View>
      {dismissible && onDismiss && (
        <Pressable onPress={onDismiss} style={[styles.closeBtn, Platform.OS === 'web' && (sgds.cursor as any)]}>
          <X size={16} color={c.textTertiary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  alert: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: spacing.base, borderRadius: radius.xl, borderWidth: 1, borderLeftWidth: 4 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  action: { marginTop: 8 },
  closeBtn: { padding: 4 },
});
