import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { SGButton } from './SGButton';
import { useTheme, typography, spacing } from '../../theme/theme';

interface Props {
  emoji?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SGEmptyState({ emoji, icon, title, subtitle, actionLabel, onAction, style }: Props) {
  const c = useTheme();
  return (
    <View style={[styles.wrap, style]}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      {icon && !emoji && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={[typography.h3, { color: c.text, textAlign: 'center' }]}>{title}</Text>
      {subtitle && <Text style={[typography.body, { color: c.textSecondary, textAlign: 'center', maxWidth: 360 }]}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <SGButton title={actionLabel} onPress={onAction} size="md" style={{ marginTop: 8 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', padding: spacing['3xl'], gap: 12 },
  emoji: { fontSize: 56, marginBottom: 8 },
  iconWrap: { marginBottom: 8 },
});
