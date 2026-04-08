import React from 'react';
import { Text, View } from 'react-native';
import { BarChart3 } from 'lucide-react-native';

import { SGPlanningNumberField } from '@sgroup/ui/src/ui/components';
import { fmt } from '../calculations';
import type { Plan, PlanTotalMetrics, PlanTotalPalette } from '../types';

type ProfitSectionProps = {
  plan: Plan;
  metrics: PlanTotalMetrics;
  palette: PlanTotalPalette;
  isMobile: boolean;
  setField: (key: keyof Plan, value: number) => void;
};

export function ProfitSection({
  plan,
  metrics,
  palette,
  isMobile,
  setField,
}: ProfitSectionProps) {
  const { text2 } = palette;

  return (
    <View style={{ flex: 1.2, minWidth: isMobile ? 0 : 560, backgroundColor: '#0F172A', borderRadius: 30, padding: isMobile ? 18 : 30 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <BarChart3 size={20} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={{ color: '#FFFFFF', fontSize: isMobile ? 20 : 24, fontWeight: '900' }}>3. Báo cáo P&L</Text>
      </View>

      <View style={{ flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: isMobile ? 0 : 260, paddingRight: isMobile ? 0 : 28, borderRightWidth: isMobile ? 0 : 1, borderRightColor: 'rgba(255,255,255,0.08)' }}>
          {[
            { label: '1. L?i nhu?n G?p (GP)', value: fmt(metrics.totalNetCommission), color: '#34D399' },
            { label: '2. (-) Chi phí V?n hành (OPEX)', value: fmt(metrics.totalOpexYear), color: '#FB7185' },
          ].map((row) => (
            <View key={row.label} style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
              <Text style={{ color: '#94A3B8', fontSize: 16, fontWeight: '700' }}>{row.label}</Text>
              <Text style={{ marginTop: 8, color: row.color, fontSize: isMobile ? 24 : 32, fontWeight: '900' }}>{row.value} T?</Text>
            </View>
          ))}

          <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
            <Text style={{ color: '#FFFFFF', fontSize: isMobile ? 18 : 20, fontWeight: '900' }}>3. L?i nhu?n Tru?c thu? (EBT)</Text>
            <Text style={{ marginTop: 8, color: '#FFFFFF', fontSize: isMobile ? 34 : 40, fontWeight: '900' }}>{fmt(metrics.ebt)} T?</Text>
          </View>

          <View style={{ paddingTop: 16 }}>
            <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: '800', marginBottom: 10 }}>THU? TNDN</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <SGPlanningNumberField
                value={plan.taxRate}
                onChangeValue={(v) => setField('taxRate', v)}
                step={1}
                min={0}
                max={100}
                precision={0}
                unit="%"
                accent="#FFFFFF"
                containerStyle={{ width: 110 }}
                inputStyle={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#FFFFFF',
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  textAlign: 'center',
                  fontWeight: '800',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.12)',
                }}
              />
              <Text style={{ color: '#FB7185', fontSize: isMobile ? 24 : 28, fontWeight: '900' }}>-{fmt(metrics.tax)} T?</Text>
            </View>
          </View>
        </View>

        <View style={{ flex: 1, minWidth: isMobile ? 0 : 260, paddingLeft: isMobile ? 0 : 28, justifyContent: 'center', alignItems: 'center', marginTop: isMobile ? 24 : 0 }}>
          <Text style={{ color: '#64748B', fontSize: 11, fontWeight: '900', letterSpacing: 3 }}>L?I NHU?N RÒNG</Text>
          <Text style={{ marginTop: 20, color: metrics.netProfit >= 0 ? '#34D399' : '#FB7185', fontSize: isMobile ? 62 : 86, fontWeight: '900' }}>
            {fmt(metrics.netProfit)}
          </Text>
          <Text style={{ color: '#64748B', fontSize: 16, fontWeight: '900', letterSpacing: 4 }}>T? VNÐ</Text>

          <View style={{ flexDirection: 'row', gap: 12, width: '100%', marginTop: 28 }}>
            {[
              { label: 'ROS', value: `${fmt(metrics.ros, 1)}%`, color: '#34D399' },
              { label: 'GP MARGIN', value: `${fmt(metrics.gpMargin, 1)}%`, color: '#60A5FA' },
            ].map((item) => (
              <View key={item.label} style={{ flex: 1, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <Text style={{ color: '#64748B', fontSize: 10, fontWeight: '900', letterSpacing: 1.4 }}>{item.label}</Text>
                <Text style={{ marginTop: 6, color: item.color, fontSize: 24, fontWeight: '900' }}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Text style={{ marginTop: 16, color: text2, fontSize: 12 }}>
        Báo cáo t? d?ng c?p nh?t theo doanh thu, bi?n phí, d?nh phí và thu? su?t dang nh?p.
      </Text>
    </View>
  );
}
