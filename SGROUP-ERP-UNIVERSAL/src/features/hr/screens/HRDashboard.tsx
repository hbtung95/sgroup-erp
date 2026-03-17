/**
 * HRDashboard — Overview dashboard with KPIs, headcount stats, and HR activities
 */
import React from 'react';
import { View, Text, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Users, UserMinus, Briefcase, Clock, TrendingUp, Building, Cake, Zap, Radio } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { useHRDashboard, useDepartments, useDashboardEvents, useDashboardActivities } from '../hooks/useHR';

const ACCENT = '#ec4899'; // Pink-500

// KPI cards are now driven by API data

const DEPT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#6366f1', '#f43f5e'];

// Events & Activities from API

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function HRDashboard() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const { data: dashboard, isLoading } = useHRDashboard();
  const { data: departments } = useDepartments();
  const { data: events } = useDashboardEvents();
  const { data: activities } = useDashboardActivities();

  const allEvents = events || [];
  const allActivities = activities || [];

  const KPI_CARDS = [
    { id: 'k1', label: 'TỔNG NHÂN SỰ', value: String(dashboard?.totalEmployees ?? 0), unit: 'người', color: '#ec4899', icon: Users, trend: 'up' as const, trendVal: 5 },
    { id: 'k2', label: 'ĐANG LÀM VIỆC', value: String(dashboard?.activeEmployees ?? 0), unit: '', color: '#22c55e', icon: Users, trend: 'up' as const, trendVal: 3 },
    { id: 'k3', label: 'THỬ VIỆC', value: String(dashboard?.probationEmployees ?? 0), unit: '', color: '#3b82f6', icon: Briefcase, trend: 'up' as const, trendVal: 12 },
    { id: 'k4', label: 'ĐƠN CHỜ DUYỆT', value: String(dashboard?.pendingLeaves ?? 0), unit: '', color: '#8b5cf6', icon: Clock, trend: 'down' as const, trendVal: 8 },
  ];

  const deptList = (departments || []).map((d: any, i: number) => {
    const totalEmp = dashboard?.totalEmployees || 1;
    const count = d._count?.employees ?? 0;
    return { ...d, count, pct: Math.round((count / totalEmp) * 100), color: DEPT_COLORS[i % DEPT_COLORS.length] };
  });

  const card: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 28, padding: 28,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px)', boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)' } : {}),
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 28, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <LinearGradient colors={['#f43f5e', '#ec4899']} style={{ width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#ec4899', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}>
            <Briefcase size={28} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>TỔNG QUAN NHÂN SỰ</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>Dữ liệu thời gian thực — Tháng 03/2026</Text>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
          {KPI_CARDS.map(k => (
            <View key={k.id} style={{
              flex: 1, minWidth: 220, backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#ffffff',
              borderRadius: 24, padding: 24,
              borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
              shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.04, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${k.color}1A`, alignItems: 'center', justifyContent: 'center' }}>
                  {(() => { const Icon = k.icon; return <Icon size={22} color={k.color} />; })()}
                </View>
                <View style={{ backgroundColor: k.trend === 'up' ? '#22c55e1A' : '#f43f5e1A', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: k.trend === 'up' ? '#16a34a' : '#e11d48' }}>
                    {k.trend === 'up' ? '+' : '-'}{k.trendVal}%
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 11, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                <Text style={{ fontSize: 36, fontWeight: '900', color: cText, letterSpacing: -1 }}>{k.value}</Text>
                {k.unit ? <Text style={{ fontSize: 14, fontWeight: '700', color: '#94a3b8' }}>{k.unit}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
          {/* Department Breakdown */}
          <View style={[card, { flex: 1.4, minWidth: 500 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${ACCENT}1A`, alignItems: 'center', justifyContent: 'center' }}>
                <Building size={18} color={ACCENT} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: cText, flex: 1 }}>Cán bộ theo Phòng ban</Text>
            </View>
            {deptList.length === 0 && !isLoading && (
              <Text style={{ color: cSub, fontSize: 13, textAlign: 'center', padding: 20 }}>Chưa có phòng ban nào</Text>
            )}
            {deptList.map((d: any, i: number) => (
              <View key={d.id} style={{
                flexDirection: 'row', alignItems: 'center', paddingVertical: 14,
                borderBottomWidth: i < deptList.length - 1 ? 1 : 0,
                borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
              }}>
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: `${d.color}15`, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                  <Text style={{ fontSize: 14, fontWeight: '900', color: d.color }}>{d.pct}%</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: cText }}>{d.name}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8', marginTop: 3 }}>
                    {d.manager?.fullName ? `Trưởng phòng: ${d.manager.fullName}` : `Mã: ${d.code}`}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: cText }}>{d.count} CBNV</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Upcoming Events */}
          <View style={[card, { flex: 1, minWidth: 340 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f59e0b1A', alignItems: 'center', justifyContent: 'center' }}>
                <Cake size={18} color="#f59e0b" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>Sự kiện sắp tới</Text>
            </View>
            {allEvents.map((e: any, i: number) => (
              <View key={i} style={{ marginBottom: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>{e.name}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#94a3b8' }}>{e.role}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 14, fontWeight: '900', color: e.type === 'birthday' ? '#ec4899' : '#3b82f6' }}>{e.date}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#64748b' }}>{e.desc}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Activity Stream */}
        <View style={[card, {}]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#8b5cf61A', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="#8b5cf6" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>Biến động & Hoạt động</Text>
          </View>
          {allActivities.map((a: any, i: number) => (
            <View key={a.id || i} style={{
              flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 14,
              borderBottomWidth: i < allActivities.length - 1 ? 1 : 0,
              borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: a.tone, marginTop: 6 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>{a.title}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', marginTop: 3 }}>{a.detail}</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b' }}>{a.time}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
