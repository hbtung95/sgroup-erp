import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import { useTheme, typography, sgds, radius, spacing } from '../../theme/theme';
import { SGProgressBar } from './SGProgressBar';
import { SGStatusBadge, StatusType } from './SGStatusBadge';

interface Stat { label: string; value: string | number; color?: string }

interface Props {
  title: string;
  color: string;
  status?: string;
  statusType?: StatusType;
  stats?: Stat[];
  progress?: number;
  progressLabel?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function SGProjectCard({ title, color, status, statusType, stats, progress, progressLabel, onPress, style }: Props) {
  const c = useTheme();
  const isDark = c.bg === '#0A0E1A' || c.bg.startsWith('rgba') || c.bg.startsWith('#0');

  return (
    <View style={[styles.card, {
      borderColor: isDark ? `${color}25` : `${color}15`,
      backgroundColor: isDark ? `${color}08` : `${color}04`,
    }, Platform.OS === 'web' && ({
      ...sgds.transition.fast,
    } as any), style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typography.bodyBold, { color: c.text, fontWeight: '900', flex: 1 }]} numberOfLines={1}>{title}</Text>
        {status && <SGStatusBadge status={(statusType || 'pending') as StatusType} text={status} />}
      </View>

      {/* Stats */}
      {stats && stats.length > 0 && (
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={[typography.label, { color: c.textTertiary, marginBottom: 6 }]}>{s.label}</Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: s.color || c.text }}>{s.value}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Progress */}
      {progress != null && (
        <View style={styles.progressWrap}>
          {progressLabel && <Text style={[typography.label, { color: c.textTertiary, marginBottom: 8 }]}>{progressLabel}</Text>}
          <SGProgressBar progress={progress} color={color} label={progressLabel} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 300, borderRadius: radius['2xl'], padding: spacing['2xl'], borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  progressWrap: {},
});
