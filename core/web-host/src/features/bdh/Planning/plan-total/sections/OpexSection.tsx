import React from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { Filter } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SGPlanningNumberField, SGPlanningSectionTitle } from '@sgroup/ui/src/ui/components';
import { OPEX_COLUMNS } from '../constants';
import { fmt, fmt0 } from '../calculations';
import type { Plan, PlanTotalMetrics, PlanTotalPalette } from '../types';

type OpexSectionProps = {
  plan: Plan;
  metrics: PlanTotalMetrics;
  palette: PlanTotalPalette;
  cardStyle: ViewStyle;
  isMobile: boolean;
  setField: (key: keyof Plan, value: number) => void;
};

export function OpexSection({
  plan,
  metrics,
  palette,
  cardStyle,
  isMobile,
  setField,
}: OpexSectionProps) {
  const { isDark, surface, soft, border, text, text2, text3 } = palette;

  return (
    <View style={cardStyle}>
      <SGPlanningSectionTitle
        icon={Filter}
        title="2. Ð?nh phí V?n hành (Tháng)"
        accent="#E11D48"
        subtitle="Ðon v? tính: Tri?u VNÐ"
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        {OPEX_COLUMNS.map((col) => {
          const groupTotal = col.items.reduce((sum, item) => {
            const value = item.auto ? metrics.autoInsurance : Number(plan[item.key] || 0);
            return sum + value;
          }, 0);
          const Icon = col.icon;

          return (
            <View
              key={col.title}
              style={{
                flex: 1,
                minWidth: isMobile ? 260 : 230,
                backgroundColor: soft,
                borderWidth: 1,
                borderColor: border,
                borderRadius: 24,
                overflow: 'hidden',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, borderBottomWidth: 1, borderBottomColor: border }}>
                <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: `${col.color}18`, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={16} color={col.color} strokeWidth={2.4} />
                </View>
                <Text style={{ flex: 1, fontSize: 11, fontWeight: '900', color: col.color, letterSpacing: 1 }}>
                  {col.title.toUpperCase()}
                </Text>
              </View>

              <View style={{ padding: 16, gap: 14 }}>
                {col.items.map((item) => {
                  const value = item.auto ? metrics.autoInsurance : Number(plan[item.key] || 0);
                  return (
                    <View key={item.key}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: text2 }}>{item.label}</Text>
                        {item.auto ? <Text style={{ fontSize: 9, fontWeight: '900', color: '#F59E0B', letterSpacing: 1 }}>AUTO</Text> : null}
                      </View>
                      <SGPlanningNumberField
                        value={value}
                        onChangeValue={(v) => setField(item.key, v)}
                        step={1}
                        min={0}
                        precision={0}
                        unit="TR"
                        readOnly={item.auto}
                        accent={item.auto ? '#D97706' : text}
                        inputStyle={{
                          backgroundColor: item.auto ? (isDark ? 'rgba(245,158,11,0.1)' : '#FFFBEB') : surface,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: item.auto ? '#FCD34D' : border,
                          color: item.auto ? '#D97706' : text,
                          textAlign: 'right',
                          fontWeight: '800',
                          fontSize: 16,
                          paddingVertical: 12,
                          paddingHorizontal: 14,
                        }}
                      />
                    </View>
                  );
                })}
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: border, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 10, fontWeight: '900', color: text3, letterSpacing: 1.4 }}>T?NG NHÓM</Text>
                <Text style={{ fontSize: 18, fontWeight: '900', color: col.color }}>
                  {fmt0(groupTotal)} <Text style={{ fontSize: 10 }}>Tri?u</Text>
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: 24 }}>
        {[
          {
            label: 'CHI PHÍ / THÁNG',
            value: fmt0(metrics.totalOpexMonth),
            unit: 'Tri?u',
            colors: ['#ECFDF5', '#D1FAE5'] as [string, string],
            textColor: '#047857',
          },
          {
            label: 'T?NG Ð?NH PHÍ / NAM',
            value: fmt(metrics.totalOpexYear),
            unit: 'T?',
            colors: ['#FEF2F2', '#FEE2E2'] as [string, string],
            textColor: '#BE123C',
          },
          {
            label: 'T? L? / DOANH THU',
            value: fmt(metrics.opexPctRevenue, 1),
            unit: '%',
            colors: ['#EEF2FF', '#E0E7FF'] as [string, string],
            textColor: '#4338CA',
          },
        ].map((box) => (
          <LinearGradient
            key={box.label}
            colors={box.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ minWidth: isMobile ? 180 : 240, paddingHorizontal: 24, paddingVertical: 20, borderRadius: 24, flexGrow: isMobile ? 1 : 0 }}
          >
            <Text style={{ color: box.textColor, fontSize: 10, fontWeight: '900', letterSpacing: 1.6 }}>{box.label}</Text>
            <Text style={{ marginTop: 8, color: box.textColor, fontSize: isMobile ? 28 : 34, fontWeight: '900' }}>
              {box.value} <Text style={{ fontSize: 14 }}>{box.unit}</Text>
            </Text>
          </LinearGradient>
        ))}
      </View>
    </View>
  );
}
