import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

interface Props {
  icon?: React.ReactNode;
  title: string;
  seq?: number;
  style?: ViewStyle;
}

export function SGSectionHeader({ icon, title, seq, style }: Props) {
  const c = useTheme();
  return (
    <View style={[styles.row, style]}>
      <View style={[styles.accent, { backgroundColor: c.brand }]} />
      {seq != null && (
        <View style={[styles.seq, { backgroundColor: `${c.brand}15` }]}>
          <Text style={[typography.smallBold, { color: c.brand }]}>{seq}</Text>
        </View>
      )}
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[typography.h4, { color: c.text }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20, marginTop: 8 },
  accent: { width: 4, height: 24, borderRadius: 2 },
  seq: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  icon: {},
});
