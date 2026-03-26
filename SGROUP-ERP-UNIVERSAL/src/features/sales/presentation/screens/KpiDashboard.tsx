/**
 * KpiDashboard — Role-aware KPI Board
 * - sales: Personal KPIs
 * - team_lead: Team KPIs + staff ranking within own team
 * - sales_manager: All teams comparison
 * - sales_director / ceo / sales_admin: Department-wide overview + team leaderboard + top performers
 */
import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, Platform, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import {
  Trophy, TrendingUp, DollarSign, Users, Target, Award, ChevronDown,
  BarChart3, Medal, Star, ArrowUpRight, ArrowDownRight, Briefcase, Hash,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { SGCard, SGTable, SGPlanningSectionTitle } from '../../../../shared/ui/components';
import type { SalesRole } from '../../SalesSidebar';
import {
  useGetKpiCards, useGetTeamPerformance, useGetStaffPerformance,
} from '../../hooks/useSalesReport';
import { useTeams } from '../../hooks/useTeams';

// ─── Helpers ───
const fmt = (n: number) => n.toLocaleString('vi-VN');
const fmtBn = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} Tỷ`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} Tr`;
  return fmt(n);
};

const MONTHS = [
  'Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
  'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12',
];

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze

export function KpiDashboard({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const now = new Date();
  const [selectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Role logic
  const isSales = userRole === 'sales';
  const isTeamLead = userRole === 'team_lead';
  const isManager = userRole === 'sales_manager';
  const isDirector = userRole === 'sales_director' || userRole === 'ceo' || userRole === 'sales_admin';
  const showTeamBoard = isManager || isDirector;
  const showStaffBoard = !isSales; // team_lead+

  // Data hooks
  const { data: kpiRaw, isLoading: kpiLoading } = useGetKpiCards({
    year: selectedYear, month: selectedMonth,
    teamId: selectedTeamId,
  });
  const { data: teamPerf, isLoading: teamLoading } = useGetTeamPerformance({
    year: selectedYear, month: selectedMonth,
  });
  const { data: staffPerf, isLoading: staffLoading } = useGetStaffPerformance({
    year: selectedYear, month: selectedMonth,
    teamId: selectedTeamId,
  });
  const { teams } = useTeams();

  // KPI cards transform
  const kpi = useMemo(() => {
    if (!kpiRaw) return null;
    return kpiRaw;
  }, [kpiRaw]);

  // Card style
  const card: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.55)' : 'rgba(255,255,255,0.85)',
    borderRadius: 32, padding: 32,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(40px)',
      boxShadow: isDark ? '0 16px 40px rgba(0,0,0,0.5)' : '0 12px 32px rgba(0,0,0,0.06)',
    } : {}),
  };

  const kpiCards = [
    { key: 'deals', label: 'GIAO DỊCH HOÀN TẤT', value: kpi?.totalDeals ?? 0, unit: 'GD', color: '#22c55e', icon: Briefcase },
    { key: 'gmv', label: 'TỔNG DOANH SỐ (GMV)', value: fmtBn(kpi?.totalGMV ?? 0), unit: '', color: '#3b82f6', icon: DollarSign },
    { key: 'revenue', label: 'HOA HỒNG', value: fmtBn(kpi?.totalRevenue ?? 0), unit: '', color: '#8b5cf6', icon: TrendingUp },
    { key: 'staff', label: isSales ? 'TARGET CÁ NHÂN' : 'NHÂN VIÊN ACTIVE', value: kpi?.staffCount ?? 0, unit: isSales ? '' : 'người', color: '#f59e0b', icon: Users },
  ];

  // Sorted teams for leaderboard
  const sortedTeams = useMemo(() => {
    if (!teamPerf) return [];
    return [...teamPerf].sort((a: any, b: any) => b.totalGMV - a.totalGMV);
  }, [teamPerf]);

  // Sorted staff for ranking
  const sortedStaff = useMemo(() => {
    if (!staffPerf) return [];
    return [...staffPerf];
  }, [staffPerf]);

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }}>

        {/* ─── HEADER ─── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <LinearGradient
              colors={isDark ? ['#f59e0b', '#ef4444'] : ['#f59e0b', '#f97316']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{
                width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
                shadowColor: '#f59e0b', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
              } as any}
            >
              <Trophy size={28} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>
                {isSales ? 'KPI CÁ NHÂN' : isTeamLead ? 'KPI TEAM' : isManager ? 'KPI PHÒNG KINH DOANH' : 'KPI TỔNG QUAN'}
              </Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>
                {isSales ? 'Hiệu suất & mục tiêu cá nhân' : isTeamLead ? 'Hiệu suất team của bạn' : 'Tổng hợp hiệu suất toàn bộ phòng kinh doanh'}
              </Text>
            </View>
          </View>

          {/* Filters */}
          <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
            {/* Month Picker */}
            <View style={{ position: 'relative' as any }}>
              <TouchableOpacity
                onPress={() => setShowMonthPicker(!showMonthPicker)}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14,
                  borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{MONTHS[selectedMonth - 1]} {selectedYear}</Text>
                <ChevronDown size={16} color={cSub} />
              </TouchableOpacity>
              {showMonthPicker && (
                <View style={{
                  position: 'absolute' as any, top: 52, right: 0, zIndex: 999,
                  backgroundColor: isDark ? '#1e293b' : '#fff',
                  borderRadius: 16, padding: 8, minWidth: 180,
                  borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                  ...(Platform.OS === 'web' ? { boxShadow: '0 12px 40px rgba(0,0,0,0.15)' } : {}),
                } as any}>
                  {MONTHS.map((m, i) => (
                    <TouchableOpacity
                      key={i}
                      onPress={() => { setSelectedMonth(i + 1); setShowMonthPicker(false); }}
                      style={{
                        paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
                        backgroundColor: selectedMonth === i + 1 ? (isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent',
                      }}
                    >
                      <Text style={{
                        fontSize: 14, fontWeight: selectedMonth === i + 1 ? '800' : '600',
                        color: selectedMonth === i + 1 ? '#3b82f6' : cText,
                      }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Team Filter (for manager/director) */}
            {showTeamBoard && teams.length > 0 && (
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <TouchableOpacity
                  onPress={() => setSelectedTeamId(undefined)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                    backgroundColor: !selectedTeamId ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                    borderWidth: 1, borderColor: !selectedTeamId ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: !selectedTeamId ? '#fff' : cText }}>Tất cả Team</Text>
                </TouchableOpacity>
                {teams.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedTeamId(t.id)}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                      backgroundColor: selectedTeamId === t.id ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
                      borderWidth: 1, borderColor: selectedTeamId === t.id ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'),
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: selectedTeamId === t.id ? '#fff' : cText }}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* ─── KPI SUMMARY CARDS ─── */}
        {kpiLoading ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#f59e0b" />
            <Text style={{ color: cSub, marginTop: 12, fontWeight: '600' }}>Đang tải KPI...</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
            {kpiCards.map((k, idx) => {
              const Icon = k.icon;
              return (
                <View key={k.key} style={{
                  flex: 1, minWidth: 220,
                  backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#ffffff',
                  borderRadius: 24, padding: 24,
                  borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                  ...(Platform.OS === 'web' ? {
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.04)',
                  } : {
                    shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.04, shadowRadius: 20,
                    shadowOffset: { width: 0, height: 10 }, elevation: 4,
                  }),
                } as any}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <LinearGradient colors={[`${k.color}DD`, `${k.color}99`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{
                      width: 52, height: 52, borderRadius: 16,
                      alignItems: 'center', justifyContent: 'center',
                      shadowColor: k.color, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
                    }}>
                      <Icon size={26} color="#fff" />
                    </LinearGradient>
                    {idx === 0 && kpi && (kpi as any).revenuePerStaff > 0 && (
                      <View style={{ backgroundColor: '#22c55e1A', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#16a34a' }}>
                          ~{fmtBn((kpi as any).revenuePerStaff)}/người
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>{k.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                    <Text style={{ fontSize: 36, fontWeight: '900', color: cText, letterSpacing: -1 }}>
                      {typeof k.value === 'number' ? fmt(k.value) : k.value}
                    </Text>
                    {k.unit ? <Text style={{ fontSize: 15, fontWeight: '700', color: '#94a3b8' }}>{k.unit}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ─── TEAM LEADERBOARD (Manager / Director) ─── */}
        {showTeamBoard && (
          <View style={card}>
            <SGPlanningSectionTitle
              icon={Award}
              title="Bảng Xếp Hạng Team"
              accent="#f59e0b"
              badgeText="TEAM LEADERBOARD"
              style={{ marginBottom: 24 }}
            />
            {teamLoading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#f59e0b" />
              </View>
            ) : sortedTeams.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>🏆</Text>
                <Text style={{ color: cSub, fontWeight: '700', fontSize: 15 }}>Chưa có dữ liệu team</Text>
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                {sortedTeams.map((t: any, i: number) => {
                  const maxGMV = sortedTeams[0]?.totalGMV || 1;
                  const pct = Math.round((t.totalGMV / maxGMV) * 100);
                  return (
                    <TouchableOpacity
                      key={t.team.id}
                      onPress={() => setSelectedTeamId(selectedTeamId === t.team.id ? undefined : t.team.id)}
                      activeOpacity={0.7}
                      style={{
                        flexDirection: 'row', alignItems: 'center', gap: 16,
                        padding: 24, borderRadius: 24,
                        backgroundColor: selectedTeamId === t.team.id
                          ? (isDark ? 'rgba(59,130,246,0.12)' : '#eff6ff')
                          : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)'),
                        borderWidth: 1,
                        borderColor: selectedTeamId === t.team.id
                          ? '#3b82f6'
                          : (isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'),
                        ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease', cursor: 'pointer', ':hover': { transform: 'translateX(4px)', borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1', boxShadow: '0 8px 24px rgba(0,0,0,0.05)' } } as any : {})
                      }}
                    >
                      {/* Rank Badge */}
                      {i < 3 ? (
                        <LinearGradient colors={[RANK_COLORS[i], `${RANK_COLORS[i]}88`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{
                          width: 48, height: 48, borderRadius: 16,
                          alignItems: 'center', justifyContent: 'center',
                          shadowColor: RANK_COLORS[i], shadowOpacity: 0.5, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4,
                        }}>
                          <Medal size={24} color="#fff" />
                        </LinearGradient>
                      ) : (
                        <View style={{
                          width: 48, height: 48, borderRadius: 16,
                          backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                          alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'
                        }}>
                          <Text style={{ fontSize: 16, fontWeight: '900', color: '#94a3b8' }}>#{i + 1}</Text>
                        </View>
                      )}

                      {/* Team Info */}
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <View>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{t.team.name}</Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8', marginTop: 2 }}>
                              Leader: {t.team.leaderName || '—'} • {t.staffCount} nhân viên
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ fontSize: 20, fontWeight: '900', color: '#3b82f6' }}>{fmtBn(t.totalGMV)}</Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8', marginTop: 2 }}>
                              {t.totalDeals} GD • HH: {fmtBn(t.totalRevenue)}
                            </Text>
                          </View>
                        </View>
                        {/* Progress Bar */}
                        <View style={{ height: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', borderRadius: 4 }}>
                          <LinearGradient
                            colors={i === 0 ? ['#f59e0b', '#f97316'] : i === 1 ? ['#3b82f6', '#6366f1'] : ['#8b5cf6', '#a855f7']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={{ width: `${pct}%`, height: '100%', borderRadius: 4 } as any}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ─── STAFF RANKING TABLE (Team Lead+) ─── */}
        {showStaffBoard && (
          <View style={card}>
            <SGPlanningSectionTitle
              icon={Star}
              title={isTeamLead ? 'Xếp Hạng Nhân Viên Trong Team' : 'Bảng Xếp Hạng Nhân Viên'}
              accent="#8b5cf6"
              badgeText="STAFF RANKING"
              style={{ marginBottom: 24 }}
            />
            {staffLoading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#8b5cf6" />
              </View>
            ) : sortedStaff.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>👥</Text>
                <Text style={{ color: cSub, fontWeight: '700', fontSize: 15 }}>Chưa có dữ liệu nhân viên</Text>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {/* Table Header */}
                <View style={{
                  flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12,
                  borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                }}>
                  <Text style={{ width: 50, fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 }}>#</Text>
                  <Text style={{ flex: 1.5, fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5 }}>NHÂN VIÊN</Text>
                  <Text style={{ flex: 1, fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'right' }}>DOANH SỐ</Text>
                  <Text style={{ flex: 0.6, fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'center' }}>GIAO DỊCH</Text>
                  <Text style={{ flex: 0.8, fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'right' }}>HOA HỒNG</Text>
                  <Text style={{ flex: 0.6, fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'center' }}>PIPELINE</Text>
                  <Text style={{ flex: 1, fontSize: 11, fontWeight: '800', color: '#94a3b8', letterSpacing: 0.5, textAlign: 'right' }}>TIẾN ĐỘ TARGET</Text>
                </View>

                {/* Table Rows */}
                {sortedStaff.map((s: any, i: number) => {
                  const targetPct = s.target > 0 ? Math.min(Math.round((s.totalGMV / s.target) * 100), 100) : 0;
                  const teamName = teams.find(t => t.id === s.staff.team)?.name || '';
                  return (
                    <View key={s.staff.id} style={{
                      flexDirection: 'row', alignItems: 'center',
                      paddingHorizontal: 16, paddingVertical: 14,
                      borderRadius: 14,
                      backgroundColor: i < 3
                        ? (isDark ? `${RANK_COLORS[i]}10` : `${RANK_COLORS[i]}15`)
                        : (i % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.02)' : '#fafafa')),
                    }}>
                      {/* Rank */}
                      <View style={{ width: 50 }}>
                        {i < 3 ? (
                          <LinearGradient colors={[RANK_COLORS[i], `${RANK_COLORS[i]}77`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{
                            width: 34, height: 34, borderRadius: 12,
                            alignItems: 'center', justifyContent: 'center',
                            shadowColor: RANK_COLORS[i], shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3,
                          }}>
                            <Text style={{ fontSize: 14, fontWeight: '900', color: '#fff' }}>#{i + 1}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0' }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#94a3b8' }}>{i + 1}</Text>
                          </View>
                        )}
                      </View>

                      {/* Name */}
                      <View style={{ flex: 1.5 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>{s.staff.name}</Text>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#94a3b8', marginTop: 2 }}>
                          {s.staff.code || ''}{teamName ? ` • ${teamName}` : ''}
                        </Text>
                      </View>

                      {/* GMV */}
                      <Text style={{ flex: 1, fontSize: 15, fontWeight: '900', color: '#3b82f6', textAlign: 'right' }}>
                        {fmtBn(s.totalGMV)}
                      </Text>

                      {/* Deals */}
                      <Text style={{ flex: 0.6, fontSize: 14, fontWeight: '800', color: cText, textAlign: 'center' }}>
                        {s.totalDeals}
                      </Text>

                      {/* Commission */}
                      <Text style={{ flex: 0.8, fontSize: 14, fontWeight: '800', color: '#22c55e', textAlign: 'right' }}>
                        {fmtBn(s.totalRevenue)}
                      </Text>

                      {/* Pipeline */}
                      <View style={{ flex: 0.6, alignItems: 'center' }}>
                        <View style={{
                          backgroundColor: s.pipeline > 0 ? '#3b82f61A' : (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
                          paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
                        }}>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: s.pipeline > 0 ? '#3b82f6' : '#94a3b8' }}>
                            {s.pipeline}
                          </Text>
                        </View>
                      </View>

                      {/* Target Progress */}
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        {s.target > 0 ? (
                          <View style={{ width: '100%', maxWidth: 120 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 }}>
                              <Text style={{
                                fontSize: 12, fontWeight: '800',
                                color: targetPct >= 100 ? '#16a34a' : targetPct >= 50 ? '#f59e0b' : '#ef4444',
                              }}>{targetPct}%</Text>
                            </View>
                            <View style={{ height: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                              <LinearGradient
                                colors={targetPct >= 100 ? ['#22c55e', '#16a34a'] : targetPct >= 50 ? ['#f59e0b', '#d97706'] : ['#ef4444', '#dc2626']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={{ width: `${targetPct}%`, height: '100%', borderRadius: 4 } as any}
                              />
                            </View>
                          </View>
                        ) : (
                          <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8' }}>—</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* ─── PERSONAL KPI DETAIL (Sales only) ─── */}
        {isSales && (
          <View style={card}>
            <SGPlanningSectionTitle
              icon={Target}
              title="Chi Tiết KPI Cá Nhân"
              accent="#22c55e"
              badgeText="MY KPI"
              style={{ marginBottom: 24 }}
            />
            <View style={{ gap: 20 }}>
              {[
                { label: 'Giao dịch hoàn tất', value: kpi?.totalDeals ?? 0, target: 5, color: '#22c55e' },
                { label: 'Doanh số (GMV)', value: kpi?.totalGMV ?? 0, target: 10_000_000_000, color: '#3b82f6', isCurrency: true },
                { label: 'Hoa hồng tích lũy', value: kpi?.totalRevenue ?? 0, target: 200_000_000, color: '#8b5cf6', isCurrency: true },
              ].map((item, idx) => {
                const pct = item.target > 0 ? Math.min(Math.round((item.value / item.target) * 100), 100) : 0;
                return (
                  <View key={idx}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{item.label}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: item.color }}>
                        {item.isCurrency ? fmtBn(item.value) : fmt(item.value)} / {item.isCurrency ? fmtBn(item.target) : item.target}
                      </Text>
                    </View>
                    <View style={{ height: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', borderRadius: 6, padding: 2 }}>
                      <LinearGradient
                        colors={[item.color, `${item.color}99`]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{
                          width: `${pct}%`, height: '100%', borderRadius: 4,
                          ...(Platform.OS === 'web' ? {
                            boxShadow: `0 2px 8px ${item.color}40`,
                          } : {}),
                        } as any}
                      />
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: pct >= 100 ? '#16a34a' : '#94a3b8', marginTop: 4, textAlign: 'right' }}>
                      {pct}% hoàn thành
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
}
