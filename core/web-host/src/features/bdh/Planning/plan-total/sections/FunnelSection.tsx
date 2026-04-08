import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, Text, View, type LayoutChangeEvent, type ViewStyle } from 'react-native';
import { ChevronDown, ChevronLeft, ChevronRight, Filter, PieChart, Target, TrendingUp, User, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SGPlanningNumberField, SGPlanningSectionTitle } from '@sgroup/ui/src/ui/components';
import { FUNNEL_INPUTS } from '../constants';
import { fmt, fmt0 } from '../calculations';
import type { Plan, PlanTotalMetrics, PlanTotalPalette } from '../types';

type FunnelSectionProps = {
  plan: Plan;
  metrics: PlanTotalMetrics;
  palette: PlanTotalPalette;
  cardStyle: ViewStyle;
  isMobile: boolean;
  isTablet: boolean;
  setField: (key: keyof Plan, value: number) => void;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function FunnelSection({
  plan,
  metrics,
  palette,
  cardStyle,
  isMobile,
  isTablet,
  setField,
}: FunnelSectionProps) {
  const { isDark, surface, soft, border, text, text2, text3 } = palette;
  const [trackWidth, setTrackWidth] = useState(0);

  const marketingRate = clamp(100 - plan.salesSelfGenRate, 0, 100);
  const knobSize = 28;
  const trackHeight = 12;

  const knobLeft = useMemo(() => {
    if (trackWidth <= 0) return 0;
    return trackWidth * (marketingRate / 100) - knobSize / 2;
  }, [marketingRate, knobSize, trackWidth]);

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={cardStyle}>
      <SGPlanningSectionTitle
        icon={Filter}
        title="5. Phễu bán hàng & phân bổ"
        accent="#7C3AED"
        subtitle="Kế hoạch inhouse theo funnel và nguồn lead"
      />

      <LinearGradient
        colors={isDark ? ['rgba(124,58,237,0.18)', 'rgba(79,70,229,0.16)'] : ['#FAF5FF', '#EEF2FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 28, padding: isMobile ? 18 : 26, alignItems: 'center', marginBottom: 24 }}
      >
        <Text style={{ color: '#7C3AED', fontSize: 11, fontWeight: '900', letterSpacing: 2.2 }}>
          MỤC TIÊU GIÁ TRỊ GIAO DỊCH (GMV)
        </Text>
        <Text style={{ marginTop: 8, color: '#7C3AED', fontSize: isMobile ? 48 : 74, fontWeight: '900' }}>
          {fmt(metrics.targetGMVInhouse)} <Text style={{ fontSize: isMobile ? 18 : 24 }}>Tỷ</Text>
        </Text>
        <View style={{ marginTop: 10, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: surface, borderWidth: 1, borderColor: border }}>
          <Text style={{ color: text2, fontSize: 13, fontWeight: '800' }}>
            Doanh thu Inhouse: <Text style={{ color: '#7C3AED' }}>{fmt(metrics.revInhouse)} Tỷ</Text>
          </Text>
        </View>
      </LinearGradient>

      <View style={{ flexDirection: isMobile ? 'column' : 'row', gap: 24, marginBottom: 26 }}>
        <View style={{ flex: 0.8, minWidth: isMobile ? 0 : 320, padding: 22, borderRadius: 24, backgroundColor: soft, borderWidth: 1, borderColor: border }}>
          <Text style={{ color: text3, fontSize: 11, fontWeight: '900', letterSpacing: 1.6, marginBottom: 18 }}>THAM SỐ HIỆU SUẤT</Text>
          <View style={{ gap: 16 }}>
            {FUNNEL_INPUTS.map((item) => (
              <View key={item.key}>
                <Text style={{ color: text2, fontSize: 12, fontWeight: '800', marginBottom: 8 }}>{item.label}</Text>
                <SGPlanningNumberField
                  value={Number(plan[item.key] || 0)}
                  onChangeValue={(v) => setField(item.key, v)}
                  step={item.step}
                  min={0}
                  precision={item.precision ?? 0}
                  unit={item.unit}
                  accent={text}
                  inputStyle={{
                    backgroundColor: surface,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: border,
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    color: text,
                    textAlign: 'right',
                    fontWeight: '900',
                    fontSize: 18,
                  }}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={{ flex: 1.2, minWidth: isMobile ? 0 : 360, justifyContent: 'center' }}>
          {[
            { label: '1. KHQT', value: metrics.numLeads, width: '100%', color: '#64748B', bg: soft },
            { label: '2. Hẹn gặp', value: metrics.numMeetings, width: '88%', color: '#4F46E5', bg: isDark ? 'rgba(79,70,229,0.14)' : '#EEF2FF' },
            { label: '3. Booking', value: metrics.numBookings, width: '78%', color: '#6366F1', bg: isDark ? 'rgba(99,102,241,0.16)' : '#E0E7FF' },
            { label: '4. Giao dịch', value: metrics.numDeals, width: '68%', color: '#7C3AED', bg: isDark ? 'rgba(124,58,237,0.18)' : '#F3E8FF' },
          ].map((step, idx) => (
            <View key={step.label} style={{ alignItems: 'center', marginBottom: idx === 3 ? 0 : 6 }}>
              <View
                style={{
                  width: step.width as `${number}%`,
                  backgroundColor: step.bg,
                  borderRadius: 22,
                  paddingHorizontal: isMobile ? 14 : 22,
                  paddingVertical: isMobile ? 14 : 18,
                  borderWidth: 1,
                  borderColor: border,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: step.color, fontSize: 12, fontWeight: '900', letterSpacing: 1.4 }}>{step.label.toUpperCase()}</Text>
                <Text style={{ color: step.color, fontSize: idx === 3 ? (isMobile ? 32 : 44) : (isMobile ? 24 : 32), fontWeight: '900' }}>
                  {fmt0(step.value)}
                </Text>
              </View>
              {idx < 3 ? <ChevronDown size={20} color={step.color} style={{ opacity: 0.5, marginVertical: 6 }} /> : null}
            </View>
          ))}
        </View>
      </View>

      <View style={{ padding: 22, borderRadius: 28, backgroundColor: soft, borderWidth: 1, borderColor: border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: isDark ? 'rgba(99,102,241,0.18)' : '#EEF2FF', alignItems: 'center', justifyContent: 'center' }}>
            <PieChart size={22} color="#4F46E5" strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: text, fontSize: isMobile ? 17 : 20, fontWeight: '900' }}>Phân bổ từ Marketing & Sales</Text>
            <Text style={{ color: text2, fontSize: 12 }}>Điều chỉnh tỷ trọng phân bổ giữa Marketing và Sales tự kiếm.</Text>
          </View>
        </View>

        <View style={{ marginBottom: 24, paddingHorizontal: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#2563EB', letterSpacing: 0.5 }}>MKT {marketingRate}%</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: text3, marginHorizontal: 8 }}>|</Text>
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#3B82F6', letterSpacing: 0.5 }}>SALES {plan.salesSelfGenRate}%</Text>
          </View>
          
          <View
            onLayout={handleTrackLayout}
            style={{
              height: trackHeight,
              borderRadius: trackHeight / 2,
              flexDirection: 'row',
              position: 'relative',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9',
              ...(Platform.OS === 'web' ? { cursor: 'pointer' } as any : {}),
            }}
          >
            {/* Track left (MKT) */}
            <View style={{ width: `${marketingRate}%`, backgroundColor: '#2563EB', borderTopLeftRadius: trackHeight / 2, borderBottomLeftRadius: trackHeight / 2, borderTopRightRadius: marketingRate === 100 ? trackHeight / 2 : 0, borderBottomRightRadius: marketingRate === 100 ? trackHeight / 2 : 0 }} />
            {/* Track right (SALES) */}
            <View style={{ flex: 1, backgroundColor: '#F97316', borderTopRightRadius: trackHeight / 2, borderBottomRightRadius: trackHeight / 2, borderTopLeftRadius: marketingRate === 0 ? trackHeight / 2 : 0, borderBottomLeftRadius: marketingRate === 0 ? trackHeight / 2 : 0 }} />

            {/* Thumb */}
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: trackHeight / 2 - knobSize / 2,
                left: knobLeft,
                width: knobSize,
                height: knobSize,
                borderRadius: knobSize / 2,
                backgroundColor: '#FFFFFF',
                borderWidth: 3.5,
                borderColor: '#2563EB',
                ...(Platform.OS === 'web' ? { boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)' } as any : {}),
              }}
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: 8, marginBottom: 22 }}>
          <SGPlanningNumberField
            value={marketingRate}
            onChangeValue={(v) => setField('salesSelfGenRate', clamp(100 - v, 0, 100))}
            step={1}
            min={0}
            max={100}
            precision={0}
            unit="% MKT"
            accent={text}
            inputStyle={{
              backgroundColor: surface,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: border,
              paddingVertical: 12,
              paddingHorizontal: 14,
              color: text,
              textAlign: 'center',
              fontWeight: '900',
              fontSize: 16,
            }}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ borderWidth: 1, borderColor: border, borderRadius: 20, overflow: 'hidden', minWidth: isMobile ? 760 : 0 }}>
            <View style={{ flexDirection: 'row', backgroundColor: surface, paddingVertical: 14, paddingHorizontal: 18 }}>
              <Text style={{ flex: 1, fontSize: 10, fontWeight: '900', color: text3 }}>GIAI ĐOẠN</Text>
              <Text style={{ width: isTablet ? 90 : 120, textAlign: 'center', fontSize: 10, fontWeight: '900', color: '#2563EB' }}>MARKETING</Text>
              <Text style={{ width: isTablet ? 90 : 120, textAlign: 'center', fontSize: 10, fontWeight: '900', color: text3 }}>TỔNG</Text>
              <Text style={{ width: isTablet ? 90 : 120, textAlign: 'center', fontSize: 10, fontWeight: '900', color: '#F59E0B' }}>SALES</Text>
            </View>

            {[
              { label: 'KHQT', icon: Users, mkt: metrics.numLeadsMkt, total: metrics.numLeads, sales: metrics.numLeadsSales, color: '#64748B' },
              { label: 'Hẹn gặp', icon: User, mkt: metrics.numMeetingsMkt, total: metrics.numMeetings, sales: metrics.numMeetingsSales, color: '#4F46E5' },
              { label: 'Giữ chỗ', icon: Target, mkt: metrics.numBookingsMkt, total: metrics.numBookings, sales: metrics.numBookingsSales, color: '#7C3AED' },
              { label: 'Giao dịch', icon: TrendingUp, mkt: metrics.numDealsMkt, total: metrics.numDeals, sales: metrics.numDealsSales, color: '#8B5CF6' },
            ].map((row, idx) => {
              const Icon = row.icon;
              return (
                <View
                  key={row.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 16,
                    paddingHorizontal: 18,
                    borderTopWidth: idx === 0 ? 0 : 1,
                    borderTopColor: border,
                    backgroundColor: row.label === 'Giao dịch' ? (isDark ? 'rgba(124,58,237,0.12)' : '#FAF5FF') : 'transparent',
                  }}
                >
                  <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: `${row.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={row.color} strokeWidth={2.5} />
                    </View>
                    <Text style={{ color: row.label === 'Giao dịch' ? '#7C3AED' : text, fontSize: 14, fontWeight: '900' }}>{row.label}</Text>
                  </View>
                  <Text style={{ width: isTablet ? 90 : 120, textAlign: 'center', color: '#2563EB', fontSize: isMobile ? 20 : 24, fontWeight: '900' }}>
                    {fmt0(row.mkt)}
                  </Text>
                  <Text
                    style={{
                      width: isTablet ? 90 : 120,
                      textAlign: 'center',
                      color: row.label === 'Giao dịch' ? '#7C3AED' : text,
                      fontSize: row.label === 'Giao dịch' ? (isMobile ? 24 : 28) : (isMobile ? 20 : 24),
                      fontWeight: '900',
                    }}
                  >
                    {fmt0(row.total)}
                  </Text>
                  <Text style={{ width: isTablet ? 90 : 120, textAlign: 'center', color: '#F59E0B', fontSize: isMobile ? 20 : 24, fontWeight: '900' }}>
                    {fmt0(row.sales)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
