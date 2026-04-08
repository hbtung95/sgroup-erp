import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { Target } from 'lucide-react-native';

import { SGPlanningSectionTitle } from '@sgroup/ui/src/ui/components';
import { fmt } from '../calculations';
import type { PlanTotalMetrics, PlanTotalPalette } from '../types';

type BreakEvenSectionProps = {
  metrics: PlanTotalMetrics;
  palette: PlanTotalPalette;
  cardStyle: ViewStyle;
  isMobile: boolean;
};

export function BreakEvenSection({
  metrics,
  palette,
  cardStyle,
  isMobile,
}: BreakEvenSectionProps) {
  const { isDark } = palette;

  return (
    <View style={[cardStyle, { flex: 0.8, minWidth: isMobile ? 0 : 340, marginBottom: 0 }]}> 
      <SGPlanningSectionTitle
        icon={Target}
        title="4. Break-even"
        accent="#4F46E5"
        subtitle="Phân tích di?m hòa v?n"
      />

      <View
        style={{
          padding: 22,
          borderRadius: 24,
          backgroundColor: isDark ? 'rgba(79,70,229,0.12)' : '#EEF2FF',
          borderWidth: 1,
          borderColor: isDark ? 'rgba(99,102,241,0.18)' : '#C7D2FE',
          marginBottom: 16,
        }}
      >
        <Text style={{ color: '#4F46E5', fontSize: 10, fontWeight: '900', letterSpacing: 1.6 }}>DOANH THU HÒA V?N</Text>
        <Text style={{ marginTop: 8, color: '#4F46E5', fontSize: isMobile ? 34 : 42, fontWeight: '900' }}>
          {fmt(metrics.breakEvenRevenue)} <Text style={{ fontSize: 16 }}>T?</Text>
        </Text>
        <Text style={{ marginTop: 8, color: '#6366F1', fontSize: 12 }}>
          M?c doanh thu t?i thi?u d? bù d?p {fmt(metrics.totalOpexYear)} t? d?nh phí nam.
        </Text>
      </View>

      <View
        style={{
          padding: 22,
          borderRadius: 24,
          backgroundColor: metrics.safetyMargin >= 0
            ? (isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5')
            : (isDark ? 'rgba(244,63,94,0.12)' : '#FEF2F2'),
          borderWidth: 1,
          borderColor: metrics.safetyMargin >= 0 ? '#A7F3D0' : '#FDA4AF',
        }}
      >
        <Text style={{ color: metrics.safetyMargin >= 0 ? '#059669' : '#E11D48', fontSize: 10, fontWeight: '900', letterSpacing: 1.6 }}>
          BIÊN AN TOÀN
        </Text>
        <Text style={{ marginTop: 8, color: metrics.safetyMargin >= 0 ? '#059669' : '#E11D48', fontSize: isMobile ? 34 : 42, fontWeight: '900' }}>
          {fmt(metrics.safetyMargin)} <Text style={{ fontSize: 16 }}>T?</Text>
        </Text>
        <View style={{ height: 8, borderRadius: 999, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)', overflow: 'hidden', marginTop: 16 }}>
          <View style={{ width: `${Math.min(Math.abs(metrics.safetyMarginPct), 100)}%`, height: '100%', backgroundColor: metrics.safetyMargin >= 0 ? '#10B981' : '#F43F5E' }} />
        </View>
        <Text style={{ marginTop: 10, color: metrics.safetyMargin >= 0 ? '#059669' : '#E11D48', fontSize: 12, fontWeight: '700' }}>
          {metrics.safetyMargin >= 0 ? 'An toàn' : 'R?i ro'} {fmt(Math.abs(metrics.safetyMarginPct), 1)}% so v?i hòa v?n.
        </Text>
      </View>
    </View>
  );
}
