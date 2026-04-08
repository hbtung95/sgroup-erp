import React from 'react';
import { ScrollView, Text, View, type ViewStyle } from 'react-native';
import { CreditCard, PieChart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SGPlanningNumberField, SGPlanningSectionTitle } from '@sgroup/ui/src/ui/components';
import { COST_ROWS } from '../constants';
import { fmt } from '../calculations';
import type { CostRowKey, Plan, PlanTotalMetrics, PlanTotalPalette } from '../types';

type RevenueCostSectionProps = {
  plan: Plan;
  metrics: PlanTotalMetrics;
  palette: PlanTotalPalette;
  cardStyle: ViewStyle;
  isMobile: boolean;
  isTablet: boolean;
  setField: (key: keyof Plan, value: number) => void;
  onRevenueRateChange: (key: CostRowKey, revenueRate: number) => void;
};

export function RevenueCostSection({
  plan,
  metrics,
  palette,
  cardStyle,
  isMobile,
  isTablet,
  setField,
  onRevenueRateChange,
}: RevenueCostSectionProps) {
  const { isDark, soft, border, text, text2, text3 } = palette;
  const heroInputSize = isMobile ? 56 : isTablet ? 68 : 86;

  return (
    <>
      <View style={cardStyle}>
        <SGPlanningSectionTitle icon={PieChart} title="1. B?ng Doanh thu & Chi phí" accent="#2563EB" />

        <View
          style={{
            borderRadius: 32,
            padding: isMobile ? 16 : 24,
            backgroundColor: soft,
            borderWidth: 1,
            borderColor: border,
            marginBottom: 28,
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            gap: isMobile ? 16 : 24,
          }}
        >
          <View style={{ flex: 1, minWidth: isMobile ? 0 : 320, alignItems: 'center', paddingVertical: 18 }}>
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 3, marginBottom: 10 }}>
              DOANH THU M?C TIÊU
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <SGPlanningNumberField
                value={plan.targetRevenue}
                onChangeValue={(v) => setField('targetRevenue', v)}
                step={1}
                min={0}
                precision={0}
                accent="#2563EB"
                inputStyle={{
                  fontSize: heroInputSize,
                  fontWeight: '900',
                  color: '#2563EB',
                  textAlign: 'center',
                  minWidth: isMobile ? 150 : 220,
                  paddingVertical: 0,
                }}
              />
              <Text style={{ fontSize: isMobile ? 18 : 28, fontWeight: '900', color: '#94A3B8' }}>T?</Text>
            </View>
          </View>

          {!isMobile ? <View style={{ width: 1, backgroundColor: border }} /> : null}

          <View style={{ flex: 1, minWidth: isMobile ? 0 : 320, alignItems: 'center', paddingVertical: 18 }}>
            <Text style={{ fontSize: 11, fontWeight: '900', color: '#94A3B8', letterSpacing: 3, marginBottom: 10 }}>
              PHÍ MÔI GI?I BÌNH QUÂN
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <SGPlanningNumberField
                value={plan.avgFee}
                onChangeValue={(v) => setField('avgFee', v)}
                step={0.1}
                min={0}
                precision={1}
                accent="#4F46E5"
                inputStyle={{
                  fontSize: heroInputSize,
                  fontWeight: '900',
                  color: '#4F46E5',
                  textAlign: 'center',
                  minWidth: isMobile ? 150 : 220,
                  paddingVertical: 0,
                }}
              />
              <Text style={{ fontSize: isMobile ? 18 : 28, fontWeight: '900', color: '#94A3B8' }}>%</Text>
            </View>
          </View>
        </View>

        <View style={{ borderWidth: 1, borderColor: border, borderRadius: 24, overflow: 'hidden' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: isMobile ? 960 : 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: soft }}>
                <Text style={{ flex: 1.7, color: text3, fontSize: 10, fontWeight: '900', letterSpacing: 1.8 }}>BI?N PHÍ V?N HÀNH</Text>
                <Text style={{ width: 110, textAlign: 'center', color: '#4F46E5', fontSize: 10, fontWeight: '900' }}>% / DOANH THU</Text>
                <Text style={{ width: 110, textAlign: 'center', color: text3, fontSize: 10, fontWeight: '900' }}>% / DOANH S?</Text>
                <Text style={{ width: 130, textAlign: 'right', color: '#2563EB', fontSize: 10, fontWeight: '900' }}>GIÁ TR?</Text>
                <Text style={{ width: 130, textAlign: 'right', color: '#7C3AED', fontSize: 10, fontWeight: '900' }}>TRI?U / GD</Text>
              </View>

              {COST_ROWS.map((row, index) => {
                const revenueRate = metrics.costRevenueRates[row.valueKey];
                const salesRate = plan[row.key];
                const mappedValue = metrics[row.valueKey];
                const perDeal = metrics.civPerDeal[row.valueKey];
                const Icon = row.icon;

                return (
                  <View
                    key={row.key}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: 20,
                      paddingVertical: 16,
                      backgroundColor: index % 2 === 0 ? (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(15,23,42,0.01)') : 'transparent',
                      borderTopWidth: index === 0 ? 0 : 1,
                      borderTopColor: border,
                    }}
                  >
                    <View style={{ flex: 1.7, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: `${row.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={18} color={row.color} strokeWidth={2.5} />
                      </View>
                      <Text style={{ color: text, fontSize: 15, fontWeight: '800' }}>{row.label}</Text>
                    </View>

                    <View style={{ width: 110, alignItems: 'center' }}>
                      <SGPlanningNumberField
                        value={revenueRate}
                        onChangeValue={(v) => onRevenueRateChange(row.key, v)}
                        step={0.5}
                        min={0}
                        precision={2}
                        unit="%"
                        accent="#4F46E5"
                        containerStyle={{ width: 96 }}
                        inputStyle={{
                          backgroundColor: isDark ? 'rgba(79,70,229,0.18)' : '#EEF2FF',
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: isDark ? 'rgba(99,102,241,0.3)' : '#C7D2FE',
                          color: '#4F46E5',
                          textAlign: 'center',
                          fontWeight: '900',
                          paddingVertical: 10,
                          fontSize: 14,
                        }}
                      />
                    </View>

                    <View style={{ width: 110, alignItems: 'center' }}>
                      <View style={{ backgroundColor: soft, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, minWidth: 82 }}>
                        <Text style={{ textAlign: 'center', color: text2, fontSize: 14, fontWeight: '900' }}>{fmt(salesRate, 2)}%</Text>
                      </View>
                    </View>

                    <Text style={{ width: 130, textAlign: 'right', color: '#2563EB', fontSize: 18, fontWeight: '900' }}>
                      {fmt(mappedValue)} <Text style={{ fontSize: 10, color: text3 }}>T?</Text>
                    </Text>

                    <Text style={{ width: 130, textAlign: 'right', color: '#7C3AED', fontSize: 16, fontWeight: '900' }}>
                      {fmt(perDeal, 0)} <Text style={{ fontSize: 10, color: text3 }}>Tr/GD</Text>
                    </Text>
                  </View>
                );
              })}

              <LinearGradient
                colors={isDark ? ['#312E81', '#4338CA'] : ['#1D4ED8', '#4F46E5']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingHorizontal: 20, paddingVertical: 18 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ flex: 1.7, color: '#FFFFFF', fontWeight: '900', fontSize: 18 }}>T?ng Bi?n Phí</Text>
                  <Text style={{ width: 110, textAlign: 'center', color: '#FFFFFF', fontWeight: '900', fontSize: 18 }}>
                    {fmt(metrics.totalVarCostPctRevenue)}%
                  </Text>
                  <Text style={{ width: 110, textAlign: 'center', color: '#DBEAFE', fontWeight: '900', fontSize: 18 }}>
                    {fmt(
                      plan.costSaleCommission
                        + plan.costMgmtCommission
                        + plan.costMarketing
                        + plan.costBonus
                        + plan.costDiscount
                        + plan.costOther,
                      2,
                    )}%
                  </Text>
                  <Text style={{ width: 130, textAlign: 'right', color: '#FFFFFF', fontWeight: '900', fontSize: 18 }}>
                    {fmt(metrics.totalCostInhouse)} T?
                  </Text>
                  <Text style={{ width: 130, textAlign: 'right', color: '#E9D5FF', fontWeight: '900', fontSize: 18 }}>
                    {fmt(metrics.totalCostPerDeal, 0)} Tr/GD
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </ScrollView>
        </View>
      </View>

      <LinearGradient
        colors={['#1E1B4B', '#312E81']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ borderRadius: 30, padding: isMobile ? 18 : 28, marginBottom: 24 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <View style={{ width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={isMobile ? 28 : 34} color="#C7D2FE" strokeWidth={2.4} />
            </View>
            <View>
              <Text style={{ color: '#A5B4FC', fontSize: 11, fontWeight: '900', letterSpacing: 2.4, marginBottom: 8 }}>L?I NHU?N G?P (GP)</Text>
              <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
                <View style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(99,102,241,0.2)' }}>
                  <Text style={{ color: '#C7D2FE', fontSize: 12, fontWeight: '800' }}>
                    % Doanh thu còn l?i: <Text style={{ color: '#FFFFFF' }}>{fmt(metrics.gpPctRevenue, 1)}%</Text>
                  </Text>
                </View>
                <View style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)' }}>
                  <Text style={{ color: '#C7D2FE', fontSize: 12, fontWeight: '800' }}>
                    % Doanh s? còn l?i: <Text style={{ color: '#FFFFFF' }}>{fmt(metrics.avgNetFeePct, 2)}%</Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#FFFFFF', fontSize: isMobile ? 36 : 56, fontWeight: '900' }}>{fmt(metrics.totalNetCommission)}</Text>
            <Text style={{ color: '#A5B4FC', fontSize: isMobile ? 14 : 18, fontWeight: '900', letterSpacing: 2 }}>T? VNÐ</Text>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}
