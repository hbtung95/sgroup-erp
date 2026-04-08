/**
 * HRDashboard — Overview dashboard with KPIs, headcount stats, and HR activities
 */
import React from 'react';
import { View, Text, ScrollView, Platform, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Users, UserMinus, Briefcase, Clock, TrendingUp, Building, Cake, Zap, Radio, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { useHRDashboard, useDepartments, useDashboardEvents, useDashboardActivities } from '../hooks/useHR';

const ACCENT = '#ec4899'; // Pink-500
const DEPT_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#6366f1', '#f43f5e'];

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function HRDashboard() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const { data: dashboard, isLoading } = useHRDashboard();
  const { data: rawDepts } = useDepartments();
  const { data: rawEvents } = useDashboardEvents();
  const { data: rawActivities } = useDashboardActivities();

  // API returns { success, data: [...] } — extract inner array safely
  const departments = Array.isArray(rawDepts) ? rawDepts : (rawDepts as any)?.data ?? [];
  const allEvents = Array.isArray(rawEvents) ? rawEvents : (rawEvents as any)?.data ?? [];
  const allActivities = Array.isArray(rawActivities) ? rawActivities : (rawActivities as any)?.data ?? [];

  const KPI_CARDS = [
    { id: 'k1', label: 'TỔNG NHÂN SỰ', value: String(dashboard?.totalEmployees ?? 0), unit: 'người', 
      gradient: ['#ec4899', '#f43f5e'], shadow: '#ec4899', icon: Users, trend: 'up' as const, trendVal: 5 },
    { id: 'k2', label: 'ĐANG LÀM VIỆC', value: String(dashboard?.activeEmployees ?? 0), unit: '', 
      gradient: ['#10b981', '#059669'], shadow: '#10b981', icon: Briefcase, trend: 'up' as const, trendVal: 3 },
    { id: 'k3', label: 'THỬ VIỆC', value: String(dashboard?.probationEmployees ?? 0), unit: '', 
      gradient: ['#3b82f6', '#2563eb'], shadow: '#3b82f6', icon: Users, trend: 'up' as const, trendVal: 12 },
    { id: 'k4', label: 'ĐƠN CHỜ DUYỆT', value: String(dashboard?.pendingLeaves ?? 0), unit: '', 
      gradient: ['#8b5cf6', '#6366f1'], shadow: '#8b5cf6', icon: Clock, trend: 'down' as const, trendVal: 8 },
  ];

  const deptList = (departments || []).map((d: any, i: number) => {
    const totalEmp = dashboard?.totalEmployees || 1;
    const count = d._count?.employees ?? 0;
    return { ...d, count, pct: Math.max(1, Math.round((count / totalEmp) * 100)), color: DEPT_COLORS[i % DEPT_COLORS.length] };
  });

  const sectionCardStyle: any = {
    backgroundColor: isDark ? 'rgba(30,41,59,0.35)' : '#ffffff',
    borderRadius: 28, padding: 28,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    ...(Platform.OS === 'web' ? { 
      backdropFilter: 'blur(32px)', 
      WebkitBackdropFilter: 'blur(32px)',
      boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 12px 32px rgba(0,0,0,0.04)' 
    } : {}),
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={ACCENT} />
        <Text style={{ marginTop: 16, fontSize: 14, color: cSub, fontWeight: '600' }}>Đang tải dữ liệu tổng quan...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <LinearGradient 
            colors={['#ec4899', '#8b5cf6']} start={{x:0,y:0}} end={{x:1,y:1}}
            style={{ width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', 
                   shadowColor: '#ec4899', shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}
          >
            <Briefcase size={28} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -1 }}>TỔNG QUAN HR</Text>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>Dữ liệu thời gian thực — Hệ thống Nhân sự SGroup</Text>
          </View>
        </Animated.View>

        {/* Premium KPI Cards */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
          {KPI_CARDS.map(k => (
            <LinearGradient
              key={k.id}
              colors={isDark ? ['rgba(30,41,59,0.7)', 'rgba(15,23,42,0.8)'] : ['#ffffff', '#f8fafc']}
              style={{
                flex: 1, minWidth: 220, borderRadius: 28, padding: 24,
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                shadowColor: isDark ? '#000' : k.shadow, shadowOpacity: isDark ? 0.5 : 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <LinearGradient
                  colors={k.gradient as [string, string]} start={{x:0, y:0}} end={{x:1, y:1}}
                  style={{ width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: k.shadow, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: {width:0, height:4} }}
                >
                  {(() => { const Icon = k.icon; return <Icon size={24} color="#fff" />; })()}
                </LinearGradient>
                <View style={{ backgroundColor: k.trend === 'up' ? 'rgba(34,197,94,0.15)' : 'rgba(244,63,94,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: k.trend === 'up' ? '#22c55e' : '#f43f5e' }}>
                    {k.trend === 'up' ? '↑' : '↓'} {k.trendVal}%
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: isDark ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{k.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
                <Text style={{ fontSize: 42, fontWeight: '900', color: cText, letterSpacing: -1 }}>{k.value}</Text>
                {k.unit ? <Text style={{ fontSize: 15, fontWeight: '700', color: '#94a3b8' }}>{k.unit}</Text> : null}
              </View>
            </LinearGradient>
          ))}
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 28, flexWrap: 'wrap' }}>
          {/* Department Breakdown with Progress Bars */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={[sectionCardStyle, { flex: 1.5, minWidth: 480 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <LinearGradient colors={['rgba(236,72,153,0.2)', 'rgba(236,72,153,0.05)']} style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(236,72,153,0.2)' }}>
                <Building size={20} color={ACCENT} />
              </LinearGradient>
              <Text style={{ fontSize: 20, fontWeight: '900', color: cText, flex: 1 }}>Cơ cấu Nhân sự theo Phòng ban</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#ec4899' }}>Xem tất cả</Text>
            </View>
            
            {deptList.length === 0 && !isLoading && (
              <Text style={{ color: cSub, fontSize: 14, textAlign: 'center', padding: 30 }}>Chưa có phòng ban nào được thiết lập.</Text>
            )}
            
            <View style={{ gap: 22 }}>
              {deptList.map((d: any) => (
                <View key={d.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '800', color: cText, marginBottom: 2 }}>{d.name}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>
                        {d.manager?.fullName ? `Trưởng phòng: ${d.manager.fullName}` : `Mã: ${d.code}`}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 16, fontWeight: '900', color: d.color }}>{d.count} CBNV</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>{d.pct}%</Text>
                    </View>
                  </View>
                  {/* Progress Bar Background */}
                  <View style={{ height: 8, borderRadius: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', overflow: 'hidden' }}>
                    {/* Progress Bar Fill */}
                    <LinearGradient 
                      colors={[d.color, d.color + '99']} 
                      start={{x:0,y:0}} end={{x:1,y:0}} 
                      style={{ width: `${d.pct}%`, height: '100%', borderRadius: 4 }} 
                    />
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Upcoming Events */}
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={[sectionCardStyle, { flex: 1, minWidth: 340 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <LinearGradient colors={['rgba(245,158,11,0.2)', 'rgba(245,158,11,0.05)']} style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(245,158,11,0.2)' }}>
                <Cake size={20} color="#f59e0b" />
              </LinearGradient>
              <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>Sự kiện sắp tới</Text>
            </View>
            
            <View style={{ gap: 20 }}>
              {allEvents.map((e: any, i: number) => (
                <View key={i} style={{ flexDirection: 'row', gap: 16 }}>
                  <View style={{ width: 48, height: 56, borderRadius: 14, backgroundColor: e.type === 'birthday' ? 'rgba(236,72,153,0.1)' : 'rgba(59,130,246,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: e.type === 'birthday' ? '#ec4899' : '#3b82f6', textTransform: 'uppercase' }}>{e.date.split(' ')[1]}</Text>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: e.type === 'birthday' ? '#ec4899' : '#3b82f6' }}>{e.date.split(' ')[0]}</Text>
                  </View>
                  <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: cText, marginBottom: 2 }}>{e.name}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>{e.desc} • {e.role}</Text>
                  </View>
                </View>
              ))}
              {allEvents.length === 0 && (
                 <Text style={{ color: cSub, fontSize: 14 }}>Không có sự kiện nào sắp tới.</Text>
              )}
            </View>
          </Animated.View>
        </View>

        {/* Activity Stream - Timeline Style */}
        <Animated.View entering={FadeInDown.delay(400).duration(400)} style={sectionCardStyle}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <LinearGradient colors={['rgba(139,92,246,0.2)', 'rgba(139,92,246,0.05)']} style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(139,92,246,0.2)' }}>
              <Zap size={20} color="#8b5cf6" />
            </LinearGradient>
            <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>Biến động & Hoạt động Nhân sự</Text>
          </View>
          
          <View style={{ paddingLeft: 8 }}>
            {allActivities.map((a: any, i: number) => (
              <View key={a.id || i} style={{ flexDirection: 'row', gap: 20, marginBottom: i === allActivities.length - 1 ? 0 : 24 }}>
                {/* Timeline Line & Dot */}
                <View style={{ alignItems: 'center', width: 14 }}>
                  <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: a.tone, borderWidth: 3, borderColor: isDark ? '#0f172a' : '#fff', zIndex: 2 }} />
                  {i < allActivities.length - 1 && (
                    <View style={{ width: 2, flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', marginTop: 4, marginBottom: -20 }} />
                  )}
                </View>
                
                {/* Content */}
                <View style={{ flex: 1, marginTop: -2, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.03)' : '#f1f5f9' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: cText }}>{a.title}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>{a.time}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: cSub, lineHeight: 20 }}>{a.detail}</Text>
                </View>
              </View>
            ))}
            {allActivities.length === 0 && (
              <Text style={{ color: cSub, fontSize: 14, marginLeft: 24 }}>Chưa có hoạt động nào được ghi nhận.</Text>
            )}
          </View>
        </Animated.View>
        
      </ScrollView>
    </View>
  );
}

