/**
 * MarketingDashboard — Overview dashboard with KPIs, campaign summary, lead funnel
 */
import React from 'react';
import { View, Text, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { TrendingUp, Users, Target, DollarSign, BarChart3 } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useMarketingDashboard, useCampaigns, useLeads } from '../hooks/useMarketing';

const ACCENT = '#D97706';

const fmt = (n: number) => n.toLocaleString('vi-VN');

export default function MarketingDashboard() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const { data: dashboard, isLoading } = useMarketingDashboard();
  const { data: campaigns } = useCampaigns({ status: 'RUNNING' });
  const { data: leads } = useLeads();

  const KPI_DATA = [
    { label: 'Leads (tổng)', value: dashboard?.totalLeads ?? 0, color: '#3b82f6', icon: Users },
    { label: 'Chiến dịch', value: dashboard?.totalCampaigns ?? 0, color: '#22c55e', icon: Target },
    { label: 'Chi phí tổng', value: fmt(dashboard?.totalSpend ?? 0) + ' ₫', color: '#f43f5e', icon: DollarSign },
    { label: 'Chuyển đổi', value: dashboard?.totalConversions ?? 0, color: '#8b5cf6', icon: BarChart3 },
  ];

  const campaignList = (campaigns || []).slice(0, 5);
  const leadList = (leads || []).slice(0, 5);

  const card: any = {
    backgroundColor: cardBg, borderRadius: 28, padding: 28,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)' } : {}),
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 28, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={{ width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT }}>
            <TrendingUp size={28} color="#fff" />
          </View>
          <View>
            <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>MARKETING DASHBOARD</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>Tổng hợp hiệu suất chiến dịch — Tháng 03/2026</Text>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center', flex: 1 }}>
              <ActivityIndicator size="large" color="#3b82f6" />
            </View>
          ) : KPI_DATA.map((k, i) => {
            const Icon = k.icon;
            return (
              <View key={i} style={{
                flex: 1, minWidth: 220, backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#ffffff',
                borderRadius: 24, padding: 24,
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.04, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${k.color}1A`, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={k.color} />
                  </View>
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                  <Text style={{ fontSize: 36, fontWeight: '900', color: cText, letterSpacing: -1 }}>{k.value}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
          {/* Top Campaigns */}
          <View style={[card, { flex: 1.4, minWidth: 500 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: cText, flex: 1 }}>Chiến Dịch Đang Chạy</Text>
            </View>
            {campaignList.length === 0 ? (
              <Text style={{ color: cSub, textAlign: 'center', padding: 20, fontSize: 13 }}>Chưa có chiến dịch nào</Text>
            ) : campaignList.map((c: any, i: number) => (
              <View key={c.id} style={{
                flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
                borderBottomWidth: i < campaignList.length - 1 ? 1 : 0,
                borderBottomColor: borderColor,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{c.name}</Text>
                  <Text style={{ fontSize: 12, color: cSub, marginTop: 2 }}>Spend: {fmt(Number(c.spend))} ₫ • {c.leads} leads</Text>
                </View>
                <View style={{
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                  backgroundColor: c.status === 'RUNNING' ? '#dcfce7' : c.status === 'PAUSED' ? '#fef3c7' : '#f1f5f9',
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: c.status === 'RUNNING' ? '#16a34a' : c.status === 'PAUSED' ? '#d97706' : '#64748b' }}>
                    {c.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Lead Sources — derived from real leads */}
          <View style={[card, { flex: 1, minWidth: 340 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#3b82f61A', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} color="#3b82f6" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>Lead mới nhất</Text>
            </View>
            {leadList.length === 0 ? (
              <Text style={{ color: cSub, textAlign: 'center', padding: 20, fontSize: 13 }}>Chưa có lead nào</Text>
            ) : leadList.map((l: any, i: number) => (
              <View key={l.id} style={{
                flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
                borderBottomWidth: i < leadList.length - 1 ? 1 : 0,
                borderBottomColor: borderColor,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{l.name}</Text>
                  <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>{l.source} • {l.email || l.phone || '—'}</Text>
                </View>
                <View style={{
                  paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
                  backgroundColor: l.status === 'NEW' ? '#eff6ff' : l.status === 'WON' ? '#dcfce7' : '#fef3c7',
                }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: l.status === 'NEW' ? '#3b82f6' : l.status === 'WON' ? '#16a34a' : '#d97706' }}>
                    {l.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

