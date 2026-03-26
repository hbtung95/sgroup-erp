/**
 * TargetAllocation — Phân bổ Target GMV theo team/cá nhân
 * Director/CEO/Admin: phân bổ target cho team
 * Team Lead/Manager: xem target team + cá nhân
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TextInput, Pressable } from 'react-native';
import { Target, ChevronDown, Users, TrendingUp, Edit3, Save } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGCard, SGGradientStatCard, SGTable } from '../../../../shared/ui/components';
import type { SalesRole } from '../../SalesSidebar';
import { useGetTargets, useDistributeTargets } from '../../hooks/useSalesOps';
import { useGetTeams, useGetStaff } from '../../hooks/useSalesOps';

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function TargetAllocation({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const now = new Date();

  const isDirector = userRole === 'sales_director' || userRole === 'sales_admin' || userRole === 'ceo';
  const isLeader = userRole === 'team_lead' || userRole === 'sales_manager';
  const canDistribute = isDirector;
  const scopeLabel = isDirector ? 'PHÂN BỔ TOÀN BỘ PHÒNG' : isLeader ? 'TARGET TEAM' : 'TARGET CÁ NHÂN';

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const { data: rawTargets, isLoading: loadingTargets } = useGetTargets({ year: selectedYear, month: selectedMonth });
  const { data: rawTeams } = useGetTeams();
  const { data: rawStaff } = useGetStaff();
  const distribute = useDistributeTargets();

  const targets = Array.isArray(rawTargets) ? rawTargets : [];
  const teams = Array.isArray(rawTeams) ? rawTeams : [];
  const staff = Array.isArray(rawStaff) ? rawStaff : [];

  // Aggregate targets
  const totalTarget = targets.reduce((s: number, t: any) => s + (t.targetGMV ?? 0), 0);
  const totalActual = targets.reduce((s: number, t: any) => s + (t.actualGMV ?? 0), 0);
  const overallRate = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

  // ── Team-level aggregation
  const teamTargets = teams.map((team: any) => {
    const teamTs = targets.filter((t: any) => t.teamId === team.id);
    const tgmv = teamTs.reduce((s: number, t: any) => s + (t.targetGMV ?? 0), 0);
    const agmv = teamTs.reduce((s: number, t: any) => s + (t.actualGMV ?? 0), 0);
    const rate = tgmv > 0 ? Math.round((agmv / tgmv) * 100) : 0;
    const memberCount = staff.filter((s: any) => s.teamId === team.id).length;
    return { id: team.id, name: team.name, code: team.code, leaderName: team.leaderName, memberCount, targetGMV: tgmv, actualGMV: agmv, rate };
  });

  // ── Staff-level data
  const staffTargets = targets.map((t: any) => ({
    id: t.id,
    staffName: t.staffName || '—',
    teamName: t.teamName || '—',
    targetGMV: t.targetGMV ?? 0,
    actualGMV: t.actualGMV ?? 0,
    rate: t.targetGMV > 0 ? Math.round(((t.actualGMV ?? 0) / t.targetGMV) * 100) : 0,
    deals: t.deals ?? 0,
  }));

  const TEAM_COLS: any = [
    { key: 'name', title: 'TEAM', flex: 1.5, render: (v: any, r: any) => (
      <View>
        <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>{v}</Text>
        <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>{r.code} · {r.memberCount} NV</Text>
      </View>
    ) },
    { key: 'targetGMV', title: 'TARGET (Tỷ)', flex: 1, align: 'right', render: (v: any) => <Text style={{ fontSize: 14, fontWeight: '800', color: '#8b5cf6', textAlign: 'right' }}>{fmt(v)}</Text> },
    { key: 'actualGMV', title: 'THỰC TẾ (Tỷ)', flex: 1, align: 'right', render: (v: any) => <Text style={{ fontSize: 14, fontWeight: '800', color: v > 0 ? cText : cSub, textAlign: 'right' }}>{v > 0 ? fmt(v) : '—'}</Text> },
    { key: 'rate', title: '% ĐẠT', flex: 0.8, align: 'center', render: (v: any) => {
      const clr = v >= 100 ? '#22c55e' : v >= 80 ? '#f59e0b' : v > 0 ? '#ef4444' : cSub;
      return v > 0 ? (
        <View style={{ backgroundColor: clr + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '900', color: clr }}>{v}%</Text>
        </View>
      ) : <Text style={{ fontSize: 12, color: cSub, textAlign: 'center' }}>—</Text>;
    } },
  ];

  const STAFF_COLS: any = [
    { key: 'staffName', title: 'NHÂN VIÊN', flex: 1.5, render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{v}</Text> },
    { key: 'teamName', title: 'TEAM', flex: 1, render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '600', color: '#8b5cf6' }}>{v}</Text> },
    { key: 'targetGMV', title: 'TARGET', flex: 1, align: 'right', render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '700', color: cText, textAlign: 'right' }}>{fmt(v)}</Text> },
    { key: 'actualGMV', title: 'THỰC TẾ', flex: 1, align: 'right', render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '800', color: v > 0 ? cText : cSub, textAlign: 'right' }}>{v > 0 ? fmt(v) : '—'}</Text> },
    { key: 'deals', title: 'DEALS', flex: 0.6, align: 'center', render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '800', color: '#3b82f6', textAlign: 'center' }}>{v}</Text> },
    { key: 'rate', title: '% ĐẠT', flex: 0.8, align: 'center', render: (v: any) => {
      const clr = v >= 100 ? '#22c55e' : v >= 80 ? '#f59e0b' : v > 0 ? '#ef4444' : cSub;
      return v > 0 ? (
        <View style={{ backgroundColor: clr + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '900', color: clr }}>{v}%</Text>
        </View>
      ) : <Text style={{ fontSize: 12, color: cSub, textAlign: 'center' }}>—</Text>;
    } },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#f59e0b20', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={22} color="#f59e0b" />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{scopeLabel}</Text>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Phân Bổ Target</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Tháng {String(selectedMonth).padStart(2, '0')}/{selectedYear}</Text>
            </View>
          </View>

          {/* Month selector */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[...Array(12)].map((_, i) => {
              const m = i + 1;
              const active = selectedMonth === m;
              return (
                <Pressable key={m} onPress={() => setSelectedMonth(m)} style={{
                  width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: active ? '#f59e0b' : (isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9'),
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: active ? '#fff' : cSub }}>{m}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* KPI Cards */}
        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          <SGGradientStatCard icon={<Target size={20} color="#f59e0b" />} label="TARGET TỔNG" value={fmt(totalTarget)} unit="Tỷ" color="#f59e0b" />
          <SGGradientStatCard icon={<TrendingUp size={20} color="#3b82f6" />} label="THỰC TẾ YTD" value={fmt(totalActual)} unit="Tỷ" color="#3b82f6" />
          <SGGradientStatCard icon={<Users size={20} color="#8b5cf6" />} label="TỈ LỆ ĐẠT" value={`${overallRate}`} unit="%" color={overallRate >= 80 ? '#22c55e' : '#f59e0b'} />
        </View>

        {loadingTargets ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#f59e0b" />
          </View>
        ) : (
          <>
            {/* Team Targets Table */}
            {(isDirector || isLeader) && teamTargets.length > 0 && (
              <SGCard variant="glass" noPadding>
                <View style={{ padding: 32, paddingBottom: 16 }}>
                  <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1 }}>
                    TARGET THEO TEAM
                  </Text>
                </View>
                <SGTable columns={TEAM_COLS} data={teamTargets} style={{ borderWidth: 0, backgroundColor: 'transparent' }} />
              </SGCard>
            )}

            {/* Staff Targets Table */}
            <SGCard variant="glass" noPadding>
              <View style={{ padding: 32, paddingBottom: 16 }}>
                <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1 }}>
                  TARGET THEO NHÂN VIÊN
                </Text>
              </View>
              {staffTargets.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}>🎯</Text>
                  <Text style={{ color: cSub, fontWeight: '700', fontSize: 15 }}>Chưa có phân bổ target</Text>
                </View>
              ) : (
                <SGTable columns={STAFF_COLS} data={staffTargets} style={{ borderWidth: 0, backgroundColor: 'transparent' }} />
              )}
            </SGCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}
