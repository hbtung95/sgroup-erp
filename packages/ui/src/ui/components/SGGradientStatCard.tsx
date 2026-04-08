import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';

interface Props {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  changeGood?: boolean;
  color: string;
  style?: ViewStyle;
}

export function SGGradientStatCard({ icon, label, value, unit, change, changeGood, color, style }: Props) {
  const c = useTheme();
  const isDark = c.bg === '#0A0E1A' || c.bg.startsWith('rgba') || c.bg.startsWith('#0');

  const trendUp = change != null && change > 0;
  const trendDown = change != null && change < 0;
  const trendColor = changeGood !== undefined
    ? (changeGood ? '#22c55e' : '#f59e0b')
    : (trendUp ? '#22c55e' : trendDown ? '#ef4444' : c.textTertiary);
  const TrendIcon = trendUp ? ArrowUpRight : trendDown ? ArrowDownRight : Minus;

  return (
    <LinearGradient
      colors={isDark ? [`${color}18`, `${color}05`] : [`${color}08`, `${color}03`]}
      style={[styles.card, {
        borderColor: isDark ? `${color}30` : `${color}20`,
      }, Platform.OS === 'web' && ({
        boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)',
      } as any), style]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>{icon}</View>
        <Text style={[typography.label, { color: c.textTertiary, flex: 1 }]} numberOfLines={1}>{label}</Text>
      </View>

      {/* Value */}
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color: c.text }]}>{value}</Text>
        {unit && <Text style={[styles.unit, { color: c.textTertiary }]}>{unit}</Text>}
      </View>

      {/* Trend */}
      {change != null && (
        <View style={[styles.trendRow, { marginTop: 12 }]}>
          <TrendIcon size={14} color={trendColor} />
          <Text style={[typography.caption, { color: trendColor, fontWeight: '800' }]}>
            {change > 0 ? '+' : ''}{change}%
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 140, borderRadius: radius['2xl'], padding: spacing['2xl'], borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  valueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  value: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  unit: { fontSize: 14, fontWeight: '700' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
