import React from 'react';
import { View, Text, Platform } from 'react-native';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';

type ChartDataPoint = {
  label: string;
  calls: number;
  leads: number;
  meetings: number;
  posts: number;
};

type ActivityChartProps = {
  data: ChartDataPoint[];
  height?: number;
};

const BAR_COLORS = [
  { key: 'posts', label: 'Bài đăng', color: '#3b82f6' },
  { key: 'calls', label: 'Cuộc gọi',  color: '#a855f7' },
  { key: 'leads', label: 'KHQT', color: '#22c55e' },
  { key: 'meetings', label: 'Hẹn gặp', color: '#f59e0b' },
];

export function ActivityChart({ data, height = 280 }: ActivityChartProps) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;

  const maxValue = Math.max(
    ...data.map(d => Math.max(d.calls, d.leads, d.meetings, d.posts)),
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
  const legendHeight = 30;
  const xLabelHeight = 24;
  const chartAreaHeight = height - legendHeight - xLabelHeight - 20; // actual bar drawing area in px
  const yAxisWidth = 40;

  // Dynamic bar width based on data count
  const dataCount = data.length;
  const barW = Platform.OS === 'web'
    ? Math.max(10, Math.min(32, Math.floor(500 / (dataCount * BAR_COLORS.length + dataCount))))
    : Math.max(5, Math.min(16, Math.floor(250 / (dataCount * BAR_COLORS.length + dataCount))));
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

          {/* Bars — positioned absolutely at bottom */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: dataCount <= 3 ? 'center' : 'space-evenly',
            alignItems: 'flex-end',
            gap: dataCount <= 3 ? 40 : 0,
            paddingHorizontal: 8,
            height: chartAreaHeight,
          }}>
            {data.map((d, idx) => (
              <View key={idx} style={{ alignItems: 'center' }}>
                {/* Bar group */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: barGap }}>
                  {BAR_COLORS.map(bar => {
                    const val = (d as any)[bar.key] as number;
                    const pct = niceMax > 0 ? val / niceMax : 0;
                    const barHeight = Math.round(pct * chartAreaHeight);
                    const minBarH = val > 0 ? 4 : 0;
                    const finalH = Math.max(barHeight, minBarH);

                    return (
                      <View key={bar.key} style={{ alignItems: 'center' }}>
                        {/* Value label */}
                        {val > 0 && (
                          <Text style={{
                            fontSize: 9,
                            color: bar.color,
                            fontWeight: '800',
                            marginBottom: 3,
                            textAlign: 'center',
                            minWidth: barW + 6,
                          }}>
                            {val}
                          </Text>
                        )}
                        {/* Bar */}
                        <View style={{
                          width: barW,
                          height: finalH,
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
            fontSize: 11,
            fontWeight: '700',
            color: '#64748b',
            textAlign: 'center',
            minWidth: barW * BAR_COLORS.length + barGap * (BAR_COLORS.length - 1),
          }}>
            {d.label}
          </Text>
        ))}
      </View>

      {/* Legend */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, flexWrap: 'wrap', height: legendHeight, alignItems: 'center' }}>
        {BAR_COLORS.map(bar => (
          <View key={bar.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{
              width: 10, height: 10, borderRadius: 3, backgroundColor: bar.color,
              ...(Platform.OS === 'web' ? { boxShadow: `0 1px 4px ${bar.color}40` } as any : {}),
            }} />
            <Text style={{ fontSize: 12, fontWeight: '600', color: cText }}>{bar.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
