/**
 * TeamReport — Báo cáo hiệu suất team (riêng, không reuse TeamManagement)
 * Hiển thị bảng xếp hạng team, chart performance, staff leaderboard
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { FileText, TrendingUp, Users, Target, Award, BarChart3, Trophy } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGCard, SGGradientStatCard, SGTable } from '../../../../shared/ui/components';
import type { SalesRole } from '../../SalesSidebar';
import { useGetTeamPerformance, useGetStaffPerformance } from '../../hooks/useSalesReport';

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function TeamReport({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const now = new Date();

  const isDirector = userRole === 'sales_director' || userRole === 'sales_admin' || userRole === 'ceo';
  const scopeLabel = isDirector ? 'BÁO CÁO TOÀN BỘ PHÒNG' : 'BÁO CÁO TEAM';

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear] = useState(now.getFullYear());

  const { data: rawTeamPerf, isLoading: loadingTeam } = useGetTeamPerformance({ year: selectedYear, month: selectedMonth });
  const { data: rawStaffPerf, isLoading: loadingStaff } = useGetStaffPerformance({ year: selectedYear, month: selectedMonth });

  const teamPerf = Array.isArray(rawTeamPerf) ? rawTeamPerf : [];
  const staffPerf = Array.isArray(rawStaffPerf) ? rawStaffPerf : [];

  // Aggregated stats
  const totalGMV = teamPerf.reduce((s: number, t: any) => s + (t.actualGMV ?? t.gmv ?? 0), 0);
  const totalDeals = teamPerf.reduce((s: number, t: any) => s + (t.deals ?? 0), 0);
  const topTeam = teamPerf.length > 0 ? teamPerf.reduce((a: any, b: any) => ((a.actualGMV ?? a.gmv ?? 0) >= (b.actualGMV ?? b.gmv ?? 0) ? a : b)) : null;

  // Sort teams by GMV descending
  const sortedTeams = [...teamPerf].sort((a: any, b: any) => (b.actualGMV ?? b.gmv ?? 0) - (a.actualGMV ?? a.gmv ?? 0));
  const maxGMV = sortedTeams.length > 0 ? (sortedTeams[0]?.actualGMV ?? sortedTeams[0]?.gmv ?? 0) : 0;

  // Sort staff by GMV descending, top 20
  const sortedStaff = [...staffPerf]
    .sort((a: any, b: any) => (b.actualGMV ?? b.gmv ?? 0) - (a.actualGMV ?? a.gmv ?? 0))
    .slice(0, 20);

  const TEAM_PERF_COLS: any = [
    { key: 'rank', title: '#', width: 40, render: (_: any, __: any, i: number) => (
      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: i < 3 ? ['#f59e0b', '#94a3b8', '#c27840'][i] + '20' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '900', color: i < 3 ? ['#f59e0b', '#94a3b8', '#c27840'][i] : cSub }}>{i + 1}</Text>
      </View>
    ) },
    { key: 'name', title: 'TEAM', flex: 1.5, render: (v: any, r: any) => (
      <View>
        <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>{v || r.teamName || '—'}</Text>
        <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>{r.leaderName ?? ''}</Text>
      </View>
    ) },
    { key: 'deals', title: 'DEALS', flex: 0.6, align: 'center', render: (v: any) => <Text style={{ fontSize: 14, fontWeight: '800', color: '#3b82f6', textAlign: 'center' }}>{v ?? 0}</Text> },
    { key: 'gmv', title: 'GMV (Tỷ)', flex: 1, align: 'right', render: (_: any, r: any) => {
      const gmv = r.actualGMV ?? r.gmv ?? 0;
      return <Text style={{ fontSize: 14, fontWeight: '900', color: cText, textAlign: 'right' }}>{fmt(gmv)}</Text>;
    } },
    { key: 'target', title: 'TARGET', flex: 1, align: 'right', render: (_: any, r: any) => {
      const target = r.targetGMV ?? r.target ?? 0;
      return <Text style={{ fontSize: 13, fontWeight: '700', color: cSub, textAlign: 'right' }}>{target > 0 ? fmt(target) : '—'}</Text>;
    } },
    { key: 'rate', title: '% ĐẠT', flex: 0.8, align: 'center', render: (_: any, r: any) => {
      const gmv = r.actualGMV ?? r.gmv ?? 0;
      const target = r.targetGMV ?? r.target ?? 0;
      const rate = target > 0 ? Math.round((gmv / target) * 100) : 0;
      const clr = rate >= 100 ? '#22c55e' : rate >= 80 ? '#f59e0b' : rate > 0 ? '#ef4444' : cSub;
      return rate > 0 ? (
        <View style={{ backgroundColor: clr + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '900', color: clr }}>{rate}%</Text>
        </View>
      ) : <Text style={{ fontSize: 12, color: cSub, textAlign: 'center' }}>—</Text>;
    } },
  ];

  const STAFF_PERF_COLS: any = [
    { key: 'rank', title: '#', width: 40, render: (_: any, __: any, i: number) => {
      const medals = ['🥇', '🥈', '🥉'];
      return <Text style={{ fontSize: i < 3 ? 18 : 13, fontWeight: '900', color: cSub, textAlign: 'center' }}>{i < 3 ? medals[i] : i + 1}</Text>;
    } },
    { key: 'staffName', title: 'NHÂN VIÊN', flex: 1.5, render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{v || '—'}</Text> },
    { key: 'teamName', title: 'TEAM', flex: 1, render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '600', color: '#8b5cf6' }}>{v || '—'}</Text> },
    { key: 'deals', title: 'DEALS', flex: 0.6, align: 'center', render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '800', color: '#3b82f6', textAlign: 'center' }}>{v ?? 0}</Text> },
    { key: 'gmv', title: 'GMV (Tỷ)', flex: 1, align: 'right', render: (_: any, r: any) => {
      const gmv = r.actualGMV ?? r.gmv ?? 0;
      return <Text style={{ fontSize: 14, fontWeight: '900', color: cText, textAlign: 'right' }}>{fmt(gmv)}</Text>;
    } },
    { key: 'commission', title: 'HOA HỒNG', flex: 1, align: 'right', render: (_: any, r: any) => {
      const com = r.commission ?? 0;
      return <Text style={{ fontSize: 13, fontWeight: '800', color: '#22c55e', textAlign: 'right' }}>{com > 0 ? fmt(com) : '—'}</Text>;
    } },
  ];

  const isLoading = loadingTeam || loadingStaff;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#6366f120', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={22} color="#6366f1" />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{scopeLabel}</Text>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Báo Cáo Hiệu Suất</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Tháng {String(selectedMonth).padStart(2, '0')}/{selectedYear}</Text>
            </View>
          </View>

          {/* Month picker */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[...Array(12)].map((_, i) => {
              const m = i + 1;
              const active = selectedMonth === m;
              return (
                <Pressable key={m} onPress={() => setSelectedMonth(m)} style={{
                  width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: active ? '#6366f1' : (isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9'),
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: active ? '#fff' : cSub }}>{m}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          <SGGradientStatCard icon={<TrendingUp size={20} color="#3b82f6" />} label="TỔNG GMV" value={fmt(totalGMV)} unit="Tỷ" color="#3b82f6" />
          <SGGradientStatCard icon={<Users size={20} color="#8b5cf6" />} label="TỔNG DEALS" value={`${totalDeals}`} unit="Deals" color="#8b5cf6" />
          <SGGradientStatCard icon={<Trophy size={20} color="#f59e0b" />} label="TEAM #1" value={topTeam?.name || topTeam?.teamName || '—'} unit="" color="#f59e0b" />
        </View>

        {isLoading ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : (
          <>
            {/* Team Performance Chart (bar chart) */}
            {sortedTeams.length > 0 && (
              <SGCard variant="glass" style={{ padding: 32 }}>
                <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 28 }}>
                  SO SÁNH GMV THEO TEAM
                </Text>
                <View style={{ gap: 14 }}>
                  {sortedTeams.map((team: any, i: number) => {
                    const gmv = team.actualGMV ?? team.gmv ?? 0;
                    const pct = maxGMV > 0 ? (gmv / maxGMV) * 100 : 0;
                    const colors = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444'];
                    const barColor = colors[i % colors.length];
                    return (
                      <View key={team.id ?? i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: cSub, width: 100 }} numberOfLines={1}>{team.name || team.teamName}</Text>
                        <View style={{ flex: 1, height: 24, borderRadius: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', overflow: 'hidden' }}>
                          <View style={{ width: `${pct}%` as any, height: '100%', borderRadius: 6, backgroundColor: barColor, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 8 }}>
                            {pct > 20 && <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>{fmt(gmv)}</Text>}
                          </View>
                        </View>
                        {pct <= 20 && <Text style={{ fontSize: 11, fontWeight: '700', color: cSub }}>{fmt(gmv)}</Text>}
                      </View>
                    );
                  })}
                </View>
              </SGCard>
            )}

            {/* Team Performance Table */}
            <SGCard variant="glass" noPadding>
              <View style={{ padding: 32, paddingBottom: 16 }}>
                <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1 }}>
                  XẾP HẠNG TEAM
                </Text>
              </View>
              {sortedTeams.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}>📊</Text>
                  <Text style={{ color: cSub, fontWeight: '700', fontSize: 15 }}>Chưa có dữ liệu team</Text>
                </View>
              ) : (
                <SGTable columns={TEAM_PERF_COLS} data={sortedTeams} style={{ borderWidth: 0, backgroundColor: 'transparent' }} />
              )}
            </SGCard>

            {/* Staff Leaderboard */}
            <SGCard variant="glass" noPadding>
              <View style={{ padding: 32, paddingBottom: 16 }}>
                <Text style={{ ...sgds.typo.h3, color: cText, textTransform: 'uppercase', letterSpacing: 1 }}>
                  TOP NHÂN VIÊN (LEADERBOARD)
                </Text>
              </View>
              {sortedStaff.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}>🏆</Text>
                  <Text style={{ color: cSub, fontWeight: '700', fontSize: 15 }}>Chưa có dữ liệu nhân viên</Text>
                </View>
              ) : (
                <SGTable columns={STAFF_PERF_COLS} data={sortedStaff} style={{ borderWidth: 0, backgroundColor: 'transparent' }} />
              )}
            </SGCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}
