import React, { useState } from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';

type BookingChartDataPoint = {
  label: string;
  bookings: number;
  customers: number;
  approved: number;
};

type BookingChartProps = {
  data: BookingChartDataPoint[];
  height?: number;
};

const BAR_COLORS = [
  { key: 'bookings', label: 'Số Giữ Chỗ', color: '#8b5cf6' },
  { key: 'customers', label: 'Khách Hàng (KPI)', color: '#0ea5e9' },
  { key: 'approved', label: 'Đã Duyệt', color: '#22c55e' },
];

export function BookingChart({ data, height = 280 }: BookingChartProps) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;

  // Toggleable series visibility
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(new Set(BAR_COLORS.map(b => b.key)));

  const toggleSeries = (key: string) => {
    setVisibleSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        // Don't allow disabling ALL series
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const activeBars = BAR_COLORS.filter(b => visibleSeries.has(b.key));

  const maxValue = Math.max(
    ...data.map(d => Math.max(
      ...activeBars.map(b => (d as any)[b.key] as number)
    )),
    5
  );

  // Nice Y-axis step calculation
  const yStepCount = 5;
  const rawStep = maxValue / yStepCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
  const niceStep = Math.ceil(rawStep / magnitude) * magnitude;
  const niceMax = niceStep * yStepCount;

  const yLabels: number[] = [];
  for (let i = yStepCount; i >= 0; i--) {
    yLabels.push(Math.round(niceStep * i));
  }

  // Fixed pixel measurements
  const legendHeight = 40;
  const xLabelHeight = 24;
  const chartAreaHeight = height - legendHeight - xLabelHeight - 20;
  const yAxisWidth = 40;

  // Dynamic bar width — based on active series count
  const dataCount = data.length;
  const seriesCount = activeBars.length;
  const barW = Platform.OS === 'web'
    ? Math.max(10, Math.min(32, Math.floor(500 / (dataCount * seriesCount + dataCount))))
    : Math.max(5, Math.min(16, Math.floor(250 / (dataCount * seriesCount + dataCount))));
  const barGap = Platform.OS === 'web' ? Math.max(2, Math.min(4, Math.round(barW / 4))) : 1;

  return (
    <View style={{ height, width: '100%', marginTop: 20 }}>
      {/* Main chart body: Y-axis + chart */}
      <View style={{ flexDirection: 'row', height: chartAreaHeight }}>
        {/* Y-Axis Labels */}
        <View style={{ width: yAxisWidth, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 8 }}>
          {yLabels.map((val, i) => (
            <Text key={i} style={{ fontSize: 10, color: '#64748b', fontWeight: '600' }}>
              {val}
            </Text>
          ))}
        </View>

        {/* Chart drawing area */}
        <View style={{ flex: 1, position: 'relative' }}>
          {/* Horizontal grid lines */}
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'space-between' }}>
            {yLabels.map((_, i) => (
              <View key={i} style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }} />
            ))}
          </View>

          {/* Bars */}
          <View style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            flexDirection: 'row',
            justifyContent: dataCount <= 3 ? 'center' : 'space-evenly',
            alignItems: 'flex-end',
            gap: dataCount <= 3 ? 40 : 0,
            paddingHorizontal: 8,
            height: chartAreaHeight,
          }}>
            {data.map((d, idx) => (
              <View key={idx} style={{ alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: barGap }}>
                  {activeBars.map(bar => {
                    const val = (d as any)[bar.key] as number;
                    const pct = niceMax > 0 ? val / niceMax : 0;
                    const barHeight = Math.round(pct * chartAreaHeight);
                    const minBarH = val > 0 ? 4 : 0;
                    const finalH = Math.max(barHeight, minBarH);

                    return (
                      <View key={bar.key} style={{ alignItems: 'center' }}>
                        {val > 0 && (
                          <Text style={{
                            fontSize: 9, color: bar.color, fontWeight: '800',
                            marginBottom: 3, textAlign: 'center', minWidth: barW + 6,
                          }}>
                            {val}
                          </Text>
                        )}
                        <View style={{
                          width: barW, height: finalH,
                          backgroundColor: bar.color,
                          borderTopLeftRadius: barW / 3,
                          borderTopRightRadius: barW / 3,
                          opacity: val > 0 ? 1 : 0.1,
                          ...(Platform.OS === 'web' ? {
                            transition: 'height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            boxShadow: val > 0 ? `0 -2px 8px ${bar.color}30` : 'none',
                          } as any : {}),
                        }} />
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* X-Axis Labels */}
      <View style={{
        flexDirection: 'row',
        justifyContent: dataCount <= 3 ? 'center' : 'space-evenly',
        gap: dataCount <= 3 ? 40 : 0,
        marginLeft: yAxisWidth,
        paddingHorizontal: 8,
        height: xLabelHeight,
        alignItems: 'center',
      }}>
        {data.map((d, idx) => (
          <Text key={idx} numberOfLines={1} style={{
            fontSize: 11, fontWeight: '700', color: '#64748b', textAlign: 'center',
            minWidth: barW * seriesCount + barGap * (seriesCount - 1),
          }}>
            {d.label}
          </Text>
        ))}
      </View>

      {/* Interactive Legend (clickable to toggle) */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap', height: legendHeight, alignItems: 'center' }}>
        {BAR_COLORS.map(bar => {
          const isActive = visibleSeries.has(bar.key);
          return (
            <TouchableOpacity
              key={bar.key}
              onPress={() => toggleSeries(bar.key)}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
                backgroundColor: isActive
                  ? (isDark ? `${bar.color}20` : `${bar.color}12`)
                  : (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'),
                borderWidth: 1.5,
                borderColor: isActive ? bar.color : (isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'),
                ...(Platform.OS === 'web' ? { cursor: 'pointer', transition: 'all 0.2s ease' } : {}),
              } as any}
            >
              <View style={{
                width: 10, height: 10, borderRadius: 3,
                backgroundColor: isActive ? bar.color : '#cbd5e1',
                ...(Platform.OS === 'web' && isActive ? { boxShadow: `0 1px 4px ${bar.color}40` } as any : {}),
              }} />
              <Text style={{
                fontSize: 12, fontWeight: '700',
                color: isActive ? (isDark ? '#e2e8f0' : '#1e293b') : '#94a3b8',
              }}>{bar.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
