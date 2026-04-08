import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, typography, spacing } from '../../theme/theme';
import { SGCard } from './SGCard';
import { SGIcons } from './SGIcons';
import { SGSparkline } from './SGSparkline';

interface Props {
  title: string;
  value: string;
  trend?: number;
  data?: number[];
  isLive?: boolean;
}

export function SGKpiCard({ title, value, trend, data, isLive }: Props) {
  const c = useTheme();
  const isUp = (trend || 0) >= 0;
  const trendColor = isUp ? c.success : c.danger;
  const TrendIcon = isUp ? SGIcons.ArrowUpRight : SGIcons.ArrowUpRight; // For simplicity, though you might want a down icon

  return (
    <SGCard variant="glow" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.topInfo}>
          <Text style={[typography.label, { color: c.textTertiary, marginBottom: 4 }]}>
            {title}
          </Text>
          <Text style={[typography.h1, typography.mono, { color: c.text }]}>
            {value}
          </Text>
        </View>

        {isLive && (
          <View style={[styles.liveBadge, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <View style={[styles.statusDot, { backgroundColor: c.success }]} />
            <Text style={[typography.micro, { color: c.success, fontWeight: '700' }]}>
              LIVE
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {trend !== undefined && (
          <View style={styles.trendContainer}>
            <TrendIcon size={14} color={trendColor} />
            <Text style={[typography.smallBold, { color: trendColor, marginLeft: 4 }]}>
              {isUp ? '+' : ''}{trend}%
            </Text>
          </View>
        )}
        
        {data && (
          <View style={styles.sparklineContainer}>
            <SGSparkline data={data} color={trendColor} width={100} height={32} />
          </View>
        )}
      </View>

      <style>{`
        @keyframes sgPulseRing { 
          0% { transform: scale(1); opacity: 0.5; } 
          100% { transform: scale(3); opacity: 0; } 
        }
        .sg-status-dot-pulse::after {
          content: ''; position: absolute; inset: -2px; border-radius: 50%;
          background: inherit; animation: sgPulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </SGCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 160,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topInfo: {
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'relative',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparklineContainer: {
    alignItems: 'flex-end',
  }
});
