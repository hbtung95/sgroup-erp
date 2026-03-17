/**
 * BudgetTracker — Budget & Spend Tracking
 */
import React from 'react';
import { View, Text, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Wallet, TrendingUp, AlertCircle, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useBudget } from '../hooks/useMarketing';

const ACCENT = '#D97706';

// Data from API via useBudget()

const fmtMoney = (v: number) => {
  if (v >= 1000000000) return `${(v / 1000000000).toFixed(1)} Tỷ`;
  if (v >= 1000000) return `${(v / 1000000).toFixed(0)} Tr`;
  return v.toLocaleString('vi-VN');
};

export function BudgetTracker() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const { data: budget, isLoading } = useBudget();

  const totalAllocated = budget?.totalAllocated ?? 0;
  const totalSpent = budget?.totalSpent ?? 0;
  const remaining = budget?.remaining ?? 0;
  const burnRate = totalAllocated > 0 ? Math.round(totalSpent / totalAllocated * 100) : 0;
  const channelBudgets = budget?.channels || [];

  const BUDGET_SUMMARY = [
    { id: '1', label: 'TỔNG NGÂN SÁCH', value: fmtMoney(totalAllocated), unit: '', icon: Wallet, color: '#3b82f6' },
    { id: '2', label: 'ĐÃ TIÊU (SPEND)', value: fmtMoney(totalSpent), unit: '', icon: TrendingUp, color: ACCENT },
    { id: '3', label: 'CÒN LẠI', value: fmtMoney(remaining), unit: '', icon: Activity, color: '#22c55e' },
    { id: '4', label: 'TỶ LỆ TIÊU HAO', value: String(burnRate), unit: '%', icon: AlertCircle, color: '#f59e0b' },
  ];

  const card: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)' } : {}),
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <LinearGradient colors={['#D97706', '#B45309']} style={{ width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
            <Wallet size={26} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={{ fontSize: 26, fontWeight: '900', color: cText }}>NGÂN SÁCH & CHI PHÍ</Text>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', marginTop: 3 }}>Theo dõi ngân sách Marketing — Tháng 03/2026</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={ACCENT} />
            </View>
          ) : BUDGET_SUMMARY.map(item => (
            <View key={item.id} style={[card, { flex: 1, minWidth: 200 }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${item.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                  {(() => { const Icon = item.icon; return <Icon size={20} color={item.color} />; })()}
                </View>
              </View>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -1 }}>{item.value}</Text>
                {item.unit ? <Text style={{ fontSize: 14, fontWeight: '700', color: '#94a3b8' }}>{item.unit}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Channel Budget Breakdown */}
        <View style={card}>
          <Text style={{ fontSize: 18, fontWeight: '900', color: cText, marginBottom: 24 }}>Phân Bổ Ngân Sách Theo Kênh</Text>
          <View style={{ gap: 20 }}>
            {channelBudgets.sort((a: any, b: any) => b.allocated - a.allocated).map((item: any, index: number) => {
              const spendPct = item.allocated > 0 ? Math.round((item.spent / item.allocated) * 100) : 0;
              const isOver = spendPct > 90;
              const isWarning = spendPct > 75 && !isOver;
              const barColor = isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6';

              return (
                <View key={item.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-end' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{item.channel}</Text>
                      <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#64748b' }}>ROAS: {item.roas}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: barColor }}>{fmtMoney(item.spent)} <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8' }}>/ {fmtMoney(item.allocated)}</Text></Text>
                    </View>
                  </View>
                  <View style={{ height: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc', borderRadius: 6, overflow: 'hidden' }}>
                    <View style={{ width: `${Math.min(spendPct, 100)}%`, height: '100%', backgroundColor: barColor, borderRadius: 6 }} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
