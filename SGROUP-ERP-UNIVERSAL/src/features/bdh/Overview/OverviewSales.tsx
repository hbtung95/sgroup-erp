/**
 * SGROUP ERP — Tổng quan Kinh doanh (SGDS Premium)
 * Sales Dashboard with CRM pipeline, deals, revenue breakdown, performance
 */
import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { ShoppingCart, TrendingUp, Users, Target, DollarSign, ArrowUpRight, BarChart3, CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { useGetSalesPerformance } from '../hooks/useOverview';
import { ActivityIndicator } from 'react-native';

// Data loaded from API — no mock fallbacks

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function OverviewSales() {
  const { theme, isDark } = useAppTheme();
  
  const { data: salesData, isLoading } = useGetSalesPerformance(2026);

  const kpis = salesData?.kpis || [];
  const pipeline = salesData?.pipeline || [];
  const topSellers = salesData?.topSellers || [];
  const monthly = salesData?.monthly || [];

  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cTertiary = theme.colors.textTertiary;
  
  const sec: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 28, padding: 32,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)' } : {}),
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#3b82f620', alignItems: 'center', justifyContent: 'center' }}><ShoppingCart size={22} color="#3b82f6" /></View>
          <View>
            <Text style={{ ...sgds.typo.h2, color: cText }}>Tổng quan Kinh doanh</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Sales CRM Dashboard — 2026</Text>
              {isLoading && <ActivityIndicator size="small" color="#3b82f6" />}
            </View>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
          {kpis.map((k: any) => (
            <LinearGradient key={k.id} colors={isDark ? [`${k.color}18`, `${k.color}05`] : [`${k.color}08`, `${k.color}03`]}
              style={[{ flex: 1, minWidth: 220, borderRadius: 24, padding: 28, borderWidth: 1, borderColor: isDark ? `${k.color}30` : `${k.color}20` }, Platform.OS === 'web' ? { boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.04)' } : {}] as any}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${k.color}20`, alignItems: 'center', justifyContent: 'center' }}><k.icon size={16} color={k.color} /></View>
                <Text style={{ ...sgds.typo.label, color: cTertiary, flex: 1 }}>{k.label}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ fontSize: 36, fontWeight: '900', color: cText, letterSpacing: -1 }}>{k.value}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: cTertiary }}>{k.unit}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 }}>
                <ArrowUpRight size={14} color="#22c55e" /><Text style={{ fontSize: 12, fontWeight: '800', color: '#22c55e' }}>+{k.change}%</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: cTertiary, marginLeft: 4 }}>vs cùng kỳ</Text>
              </View>
            </LinearGradient>
          ))}
        </View>

        {/* Sales Pipeline */}
        <View style={sec}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28, borderLeftWidth: 4, borderLeftColor: '#8b5cf6', paddingLeft: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#8b5cf620', alignItems: 'center', justifyContent: 'center' }}><Target size={18} color="#8b5cf6" /></View>
            <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1 }}>PHỄU BÁN HÀNG (CRM)</Text>
          </View>
          {pipeline.map((s: any, i: number) => (
            <View key={i} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{s.stage}</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: s.color }}>{fmt(s.count)} KH · {fmt(s.value)} Tỷ</Text>
              </View>
              <View style={{ height: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ width: `${s.pct}%`, height: '100%', backgroundColor: s.color, borderRadius: 4 }} />
              </View>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
          {/* Monthly Revenue Chart */}
          <View style={[sec, { flex: 1.5, minWidth: 400 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28, borderLeftWidth: 4, borderLeftColor: '#3b82f6', paddingLeft: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#3b82f620', alignItems: 'center', justifyContent: 'center' }}><BarChart3 size={18} color="#3b82f6" /></View>
              <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1 }}>DOANH SỐ THEO THÁNG</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, height: 180 }}>
              {monthly.map((m: any, i: number) => {
                const maxV = 280;
                const tH = (m.target / maxV) * 160;
                const aH = (m.actual / maxV) * 160;
                const hit = m.actual >= m.target;
                return (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: hit ? '#22c55e' : '#f59e0b', marginBottom: 4 }}>{fmt(m.actual)}</Text>
                    <View style={{ width: '100%', alignItems: 'center', gap: 2, height: 160, justifyContent: 'flex-end' }}>
                      <View style={{ width: '60%', height: tH, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0', borderRadius: 4, position: 'absolute', bottom: 0 }} />
                      <View style={{ width: '40%', height: aH, backgroundColor: hit ? '#22c55e' : '#f59e0b', borderRadius: 4, zIndex: 1 }} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: cSub, marginTop: 8 }}>{m.m}</Text>
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 20, marginTop: 16, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }} /><Text style={{ fontSize: 11, fontWeight: '600', color: cSub }}>Target</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#22c55e' }} /><Text style={{ fontSize: 11, fontWeight: '600', color: cSub }}>Đạt</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#f59e0b' }} /><Text style={{ fontSize: 11, fontWeight: '600', color: cSub }}>Chưa đạt</Text></View>
            </View>
          </View>

          {/* Top Sellers */}
          <View style={[sec, { flex: 1, minWidth: 300 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28, borderLeftWidth: 4, borderLeftColor: '#f59e0b', paddingLeft: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#f59e0b20', alignItems: 'center', justifyContent: 'center' }}><Users size={18} color="#f59e0b" /></View>
              <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1 }}>TOP SALES</Text>
            </View>
            {topSellers.map((s: any, i: number) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
                  <Text style={{ width: 30, fontSize: i < 3 ? 20 : 14, textAlign: 'center' }}>{i < 3 ? medals[i] : `#${s.rank}`}</Text>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{s.name}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: cTertiary, marginTop: 2 }}>{s.team}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 15, fontWeight: '900', color: '#8b5cf6' }}>{s.deals} GD</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: cTertiary, marginTop: 2 }}>{s.gmv} Tỷ GMV</Text>
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
