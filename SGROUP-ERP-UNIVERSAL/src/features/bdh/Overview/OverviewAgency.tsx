/**
 * SGROUP ERP — Tổng quan Đại lý (SGDS Premium)
 * Agency network F1/F2, commission tracking, performance leaderboard
 */
import React from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { Building2, TrendingUp, DollarSign, ArrowUpRight, Users, Award, MapPin, BarChart3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { useGetAgencyPerformance } from '../hooks/useOverview';
import { ActivityIndicator } from 'react-native';

// Data loaded from API — no mock fallbacks

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function OverviewAgency() {
  const { theme, isDark } = useAppTheme();
  
  const { data: agencyData, isLoading } = useGetAgencyPerformance(2026);

  const kpis = agencyData?.kpis || [];
  const agencies = agencyData?.agencies || [];
  const monthly = agencyData?.monthly || [];

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#6366f120', alignItems: 'center', justifyContent: 'center' }}><Building2 size={22} color="#6366f1" /></View>
          <View>
            <Text style={{ ...sgds.typo.h2, color: cText }}>Tổng quan Đại lý</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Agency Network — 2026</Text>
              {isLoading && <ActivityIndicator size="small" color="#6366f1" />}
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
              </View>
            </LinearGradient>
          ))}
        </View>

        {/* Agency Leaderboard */}
        <View style={sec}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28, borderLeftWidth: 4, borderLeftColor: '#6366f1', paddingLeft: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#6366f120', alignItems: 'center', justifyContent: 'center' }}><Award size={18} color="#6366f1" /></View>
            <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1 }}>BẢNG XẾP HẠNG ĐẠI LÝ</Text>
          </View>
          <View style={{ flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
            <Text style={{ flex: 2.5, fontSize: 11, fontWeight: '800', color: cTertiary, textTransform: 'uppercase' }}>TÊN ĐẠI LÝ</Text>
            <Text style={{ flex: 0.7, fontSize: 11, fontWeight: '800', color: cTertiary, textAlign: 'center', textTransform: 'uppercase' }}>LEVEL</Text>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '800', color: cTertiary, textAlign: 'right', textTransform: 'uppercase' }}>GD</Text>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '800', color: cTertiary, textAlign: 'right', textTransform: 'uppercase' }}>GMV</Text>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '800', color: cTertiary, textAlign: 'right', textTransform: 'uppercase' }}>HOA HỒNG</Text>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '800', color: cTertiary, textAlign: 'right', textTransform: 'uppercase' }}>KV</Text>
          </View>
          {agencies.map((a: any, i: number) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }}>
              <View style={{ flex: 2.5, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 8, height: 28, borderRadius: 4, backgroundColor: a.color }} />
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{a.name}</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: cTertiary, marginTop: 2 }}>⭐ {a.rating}</Text>
                </View>
              </View>
              <View style={{ flex: 0.7, alignItems: 'center' }}>
                <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: a.type === 'F1' ? '#3b82f620' : '#f59e0b20' }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: a.type === 'F1' ? '#3b82f6' : '#f59e0b' }}>{a.type}</Text>
                </View>
              </View>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '800', color: a.color, textAlign: 'right' }}>{a.deals}</Text>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: cText, textAlign: 'right' }}>{a.gmv} Tỷ</Text>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: '#22c55e', textAlign: 'right' }}>{a.comm} Tỷ</Text>
              <Text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: cSub, textAlign: 'right' }}>{a.region}</Text>
            </View>
          ))}
        </View>

        {/* Monthly Deals by F1/F2 */}
        <View style={sec}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28, borderLeftWidth: 4, borderLeftColor: '#22c55e', paddingLeft: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#22c55e20', alignItems: 'center', justifyContent: 'center' }}><BarChart3 size={18} color="#22c55e" /></View>
            <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1 }}>GIAO DỊCH F1 vs F2 THEO THÁNG</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, height: 180 }}>
            {monthly.map((m: any, i: number) => {
              const maxV = 150;
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: cSub, marginBottom: 4 }}>{m.f1 + m.f2}</Text>
                  <View style={{ width: '70%', height: 150, justifyContent: 'flex-end', gap: 2 }}>
                    <View style={{ height: (m.f1 / maxV) * 130, backgroundColor: '#3b82f6', borderRadius: 4 }} />
                    <View style={{ height: (m.f2 / maxV) * 130, backgroundColor: '#f59e0b', borderRadius: 4 }} />
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: cSub, marginTop: 8 }}>{m.m}</Text>
                </View>
              );
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 20, marginTop: 16, justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#3b82f6' }} /><Text style={{ fontSize: 11, fontWeight: '600', color: cSub }}>F1 (Trực tiếp)</Text></View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#f59e0b' }} /><Text style={{ fontSize: 11, fontWeight: '600', color: cSub }}>F2 (Gián tiếp)</Text></View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
