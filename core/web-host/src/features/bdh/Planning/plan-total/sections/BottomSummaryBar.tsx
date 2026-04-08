import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';

import { fmt, fmt0 } from '../calculations';
import type { Plan, PlanTotalMetrics, PlanTotalPalette } from '../types';

type BottomSummaryBarProps = {
  plan: Plan;
  metrics: PlanTotalMetrics;
  palette: PlanTotalPalette;
  isLoadingPlan: boolean;
  isSaving: boolean;
};

export function BottomSummaryBar({
  plan,
  metrics,
  palette,
  isLoadingPlan,
  isSaving,
}: BottomSummaryBarProps) {
  const { isDark, text, text2, text3 } = palette;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 16, flexWrap: 'wrap' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Doanh thu', value: `${fmt(plan.targetRevenue)} Tỷ`, color: text },
          { label: 'GMV', value: `${fmt(metrics.targetGMVInhouse)} Tỷ`, color: '#2563EB' },
          { label: 'Giao dịch', value: `${fmt0(metrics.numDeals)} GD`, color: text },
          { label: 'Tổng biến phí', value: `${fmt(metrics.totalCostInhouse)} Tỷ`, color: '#F59E0B' },
          { label: 'Net', value: `${fmt(metrics.totalNetCommission)} Tỷ`, color: '#4F46E5' },
          { label: 'OPEX', value: `${fmt(metrics.totalOpexYear)} Tỷ`, color: '#E11D48' },
          { label: 'Lợi nhuận ròng', value: `${fmt(metrics.netProfit)} Tỷ`, color: '#10B981' },
        ].map((item) => (
          <View key={item.label} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC' }}>
            <Text style={{ color: text3, fontSize: 9, fontWeight: '900', letterSpacing: 1.2 }}>{item.label.toUpperCase()}</Text>
            <Text style={{ color: item.color, fontSize: 16, fontWeight: '900', marginTop: 4 }}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 }}>
        {isSaving || isLoadingPlan ? (
          <ActivityIndicator size="small" color="#10B981" />
        ) : (
          <CheckCircle2 size={18} color="#10B981" strokeWidth={2.5} />
        )}
        <View>
          <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>STATUS</Text>
          <Text style={{ color: text2, fontSize: 11 }}>
            {isLoadingPlan ? 'LOADING API...' : isSaving ? 'DATA SYNCING...' : 'LIVE CONNECTED'}
          </Text>
        </View>
      </View>
    </View>
  );
}
