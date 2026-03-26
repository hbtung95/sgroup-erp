/**
 * PlanVsActual — Báo cáo Plan vs Actual theo tháng
 * - sales: Chỉ xem dữ liệu cá nhân (read-only)
 * - team_lead / sales_manager: Dữ liệu team
 * - sales_director / ceo / sales_admin: Toàn bộ phòng
 */
import React from 'react';
import { View, Text, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { BarChart3, TrendingUp, TrendingDown, Target, Eye, Info } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGCard, SGGradientStatCard, SGTable } from '../../../../shared/ui/components';
import type { SalesRole } from '../../SalesSidebar';
import { useGetPlanVsActual } from '../../hooks/useSalesReport';

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function PlanVsActual({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const isSales = userRole === 'sales';
  const isDirector = userRole === 'sales_director' || userRole === 'sales_admin' || userRole === 'ceo';
  const isLeader = userRole === 'team_lead' || userRole === 'sales_manager';
  const scopeLabel = isDirector ? 'KẾ HOẠCH TOÀN BỘ PHÒNG' : isLeader ? 'KẾ HOẠCH TEAM' : 'KẾ HOẠCH CÁ NHÂN';

  const now = new Date();
  const { data: rawData, isLoading } = useGetPlanVsActual({
    year: now.getFullYear(),
    ...(isSales ? { scope: 'personal' } : {}),
  });
  const planActualData: { month: string; plan: number; actual: number; rate: number }[] = (rawData || []).map((d: any) => ({
    month: d.month || `T${d.monthNum}`,
    plan: d.plan ?? d.targetGMV ?? 0,
    actual: d.actual ?? d.actualGMV ?? 0,
    rate: d.rate ?? (d.plan > 0 ? Math.round(((d.actual ?? d.actualGMV ?? 0) / (d.plan ?? d.targetGMV ?? 1)) * 100) : 0),
  }));

  const totalPlan = planActualData.reduce((s, m) => s + m.plan, 0);
  const totalActual = planActualData.reduce((s, m) => s + m.actual, 0);
  const overallRate = totalPlan > 0 ? Math.round((totalActual / totalPlan) * 100) : 0;
  const maxValue = planActualData.length > 0 ? Math.max(...planActualData.map(m => Math.max(m.plan, m.actual))) : 0;

  const PLAN_COLUMNS: any = [
    { key: 'month', title: 'THÁNG', flex: 0.5, render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '800', color: '#3b82f6' }}>{v}</Text> },
    { key: 'plan', title: 'KẾ HOẠCH', flex: 1, align: 'right', render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '700', color: cText, textAlign: 'right' }}>{fmt(v)}</Text> },
    { key: 'actual', title: 'THỰC TẾ', flex: 1, align: 'right', render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '900', color: v > 0 ? cText : cSub, textAlign: 'right' }}>{v > 0 ? fmt(v) : '—'}</Text> },
    { key: 'rate', title: 'CHÊNH LỆCH', flex: 1, align: 'right', render: (_: any, r: any) => {
      const diff = r.actual - r.plan;
      return (
        <Text style={{ fontSize: 13, fontWeight: '800', color: r.actual === 0 ? cSub : diff >= 0 ? '#22c55e' : '#ef4444', textAlign: 'right' }}>
          {r.actual === 0 ? '—' : (diff >= 0 ? '+' : '') + fmt(diff)}
        </Text>
      );
    } },
    { key: 'percent', title: '% ĐẠT', flex: 0.8, align: 'center', render: (_: any, r: any) => {
      const rateColor = r.actual === 0 ? cSub : r.rate >= 100 ? '#22c55e' : r.rate >= 80 ? '#f59e0b' : '#ef4444';
      return r.actual > 0 ? (
        <View style={{ backgroundColor: rateColor + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '900', color: rateColor }}>{r.rate}%</Text>
        </View>
      ) : <Text style={{ fontSize: 12, color: cSub, textAlign: 'center' }}>—</Text>;
    } },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#ec489920', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={22} color="#ec4899" />
          </View>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#ec4899', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{scopeLabel}</Text>
            <Text style={{ ...sgds.typo.h2, color: cText }}>Plan vs Actual {now.getFullYear()}</Text>
            <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>So sánh kế hoạch và thực tế GMV (Tỷ)</Text>
          </View>
        </View>

        {/* Read-only banner for sales role */}
        {isSales && (
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff',
            borderWidth: 1, borderColor: isDark ? 'rgba(59,130,246,0.25)' : '#bfdbfe',
            borderRadius: 14, padding: 14,
          }}>
            <Eye size={18} color="#3b82f6" />
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: '#3b82f6' }}>
              Chế độ chỉ xem — Hiển thị kế hoạch và thực tế cá nhân của bạn
            </Text>
          </View>
        )}

        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'KẾ HOẠCH TỔNG', value: fmt(totalPlan), unit: 'Tỷ', color: '#8b5cf6', icon: Target },
            { label: 'THỰC TẾ YTD', value: fmt(totalActual), unit: 'Tỷ', color: '#3b82f6', icon: TrendingUp },
            { label: 'TỈ LỆ ĐẠT', value: `${overallRate}`, unit: '%', color: overallRate >= 80 ? '#22c55e' : '#f59e0b', icon: overallRate >= 80 ? TrendingUp : TrendingDown },
          ].map((item, i) => (
            <SGGradientStatCard
              key={i}
              icon={<item.icon size={20} color={item.color} />}
              label={item.label}
              value={item.value}
              unit={item.unit}
              color={item.color}
            />
          ))}
        </View>

        {/* Bar Chart (Custom) */}
        <SGCard variant="glass" style={{ padding: 32 }}>
          <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 28 }}>
            BIỂU ĐỒ THEO THÁNG (GMV - TỶ VNĐ)
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', height: 200 }}>
            {planActualData.map((m, i) => {
              const planH = maxValue > 0 ? (m.plan / maxValue) * 160 : 0;
              const actualH = maxValue > 0 ? (m.actual / maxValue) * 160 : 0;
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                  <View style={{ flexDirection: 'row', gap: 2, alignItems: 'flex-end', height: 160 }}>
                    <View style={{ width: 12, height: planH, backgroundColor: isDark ? '#8b5cf640' : '#8b5cf630', borderRadius: 4 }} />
                    <View style={{ width: 12, height: actualH, backgroundColor: m.actual > 0 ? (m.rate >= 100 ? '#22c55e' : m.rate >= 80 ? '#3b82f6' : '#f59e0b') : 'transparent', borderRadius: 4 }} />
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: cSub }}>{m.month}</Text>
                  {m.actual > 0 && (
                    <Text style={{ fontSize: 9, fontWeight: '900', color: m.rate >= 100 ? '#22c55e' : m.rate >= 80 ? '#3b82f6' : '#f59e0b' }}>{m.rate}%</Text>
                  )}
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 20, marginTop: 20, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: isDark ? '#8b5cf640' : '#8b5cf630' }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: cSub }}>Kế hoạch</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#3b82f6' }} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: cSub }}>Thực tế</Text>
            </View>
          </View>
        </SGCard>

        {/* Data Table */}
        <SGCard variant="glass" noPadding>
          <View style={{ padding: 32, paddingBottom: 16 }}>
            <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1 }}>
              CHI TIẾT THEO THÁNG
            </Text>
          </View>
          <SGTable 
            columns={PLAN_COLUMNS} 
            data={planActualData} 
            onRowPress={isSales ? undefined : (row) => console.log('Press month', row)} 
            style={{ borderWidth: 0, backgroundColor: 'transparent' }}
          />
        </SGCard>
      </ScrollView>
    </View>
  );
}
