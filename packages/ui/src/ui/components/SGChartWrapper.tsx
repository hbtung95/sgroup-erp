/**
 * SGChartWrapper — Lightweight chart rendering for web using SVG
 * For React Native, falls back to bar representation.
 * Usage: <SGChartWrapper type="bar" data={data} />
 */
import React from 'react';
import { View, Text, Platform } from 'react-native';

type ChartData = { label: string; value: number; color?: string };

type Props = {
  type?: 'bar' | 'progress';
  data: ChartData[];
  height?: number;
  isDark?: boolean;
  title?: string;
};

const DEFAULT_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export function SGChartWrapper({ type = 'bar', data, height = 200, isDark = false, title }: Props) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  if (type === 'progress') {
    return (
      <View style={{ gap: 12 }}>
        {title && <Text style={{ fontSize: 14, fontWeight: '800', color: isDark ? '#e2e8f0' : '#1e293b', marginBottom: 4 }}>{title}</Text>}
        {data.map((item, i) => (
          <View key={i} style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: isDark ? '#94a3b8' : '#64748b' }}>{item.label}</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}>{item.value.toLocaleString()}</Text>
            </View>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', overflow: 'hidden' }}>
              <View style={{
                height: '100%',
                width: `${Math.min((item.value / maxValue) * 100, 100)}%`,
                borderRadius: 4,
                backgroundColor: item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
              } as any} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // Bar chart
  const barWidth = data.length > 0 ? Math.max(Math.floor(100 / data.length) - 2, 5) : 10;
  return (
    <View>
      {title && <Text style={{ fontSize: 14, fontWeight: '800', color: isDark ? '#e2e8f0' : '#1e293b', marginBottom: 12 }}>{title}</Text>}
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingBottom: 24 }}>
        {data.map((item, i) => {
          const barHeight = Math.max((item.value / maxValue) * (height - 40), 4);
          const color = item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color, marginBottom: 4 }}>
                {item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}K` : item.value}
              </Text>
              <View style={{
                width: '70%', height: barHeight, borderRadius: 6,
                backgroundColor: color,
                ...(Platform.OS === 'web' ? { transition: 'height 0.3s ease' } : {}),
              } as any} />
              <Text
                numberOfLines={1}
                style={{ fontSize: 9, fontWeight: '600', color: isDark ? '#64748b' : '#94a3b8', marginTop: 4, textAlign: 'center' }}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
