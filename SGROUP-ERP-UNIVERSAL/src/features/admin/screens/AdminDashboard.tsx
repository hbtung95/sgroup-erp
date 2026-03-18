/**
 * AdminDashboard — Premium real-time system overview
 * Uses SGPageHeader, SGGradientStatCard, SGSection, SGSkeleton, SGEmptyState
 * Staggered entry animations, number counter animations, glassmorphism
 * NEW: Activity chart (7-day trend), locked users stat, lastLoginAt in recent users
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Users, Building, Briefcase, UsersRound, UserPlus, BarChart3, Clock,
  UserCheck, UserX, Activity, Shield, FileText, Wifi, WifiOff, Zap, Inbox,
  Lock, TrendingUp,
} from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../shared/theme/theme';
import { SGPageHeader } from '../../../shared/ui/components/SGPageHeader';
import { SGGradientStatCard } from '../../../shared/ui/components/SGGradientStatCard';
import { SGSection } from '../../../shared/ui/components/SGSection';
import { SGSkeleton } from '../../../shared/ui/components/SGSkeleton';
import { SGEmptyState } from '../../../shared/ui/components/SGEmptyState';
import { SGStatusBadge } from '../../../shared/ui/components/SGStatusBadge';
import { SGAvatar } from '../../../shared/ui/components/SGAvatar';
import { useAdminStats, useAdminHealth } from '../hooks/useAdmin';
import { getRoleStyle } from '../constants/adminConstants';
import { formatRelativeDate } from '../utils/adminUtils';
import type { AdminStats, AdminUser, HealthCheck, HealthResponse, ActivityTrendItem } from '../types/adminTypes';
import { SecurityScoreCard } from '../components/SecurityScoreCard';
import { UserGrowthChart } from '../components/UserGrowthChart';
import { LoginCalendar } from '../components/LoginCalendar';

export function AdminDashboard() {
  const { colors } = useAppTheme();

  const { data: stats, isLoading } = useAdminStats();
  const { data: health } = useAdminHealth();

  // ⚠️ All hooks MUST be called before any early return
  const statCards = useMemo(() => [
    { label: 'NGƯỜI DÙNG', value: stats?.totalUsers ?? 0, icon: Users, color: colors.accent, desc: 'Tài khoản hệ thống' },
    { label: 'ĐANG HOẠT ĐỘNG', value: stats?.activeUsers ?? 0, icon: UserCheck, color: colors.success, desc: 'Users active' },
    { label: 'ĐÃ VÔ HIỆU HÓA', value: stats?.inactiveUsers ?? 0, icon: UserX, color: colors.danger, desc: 'Users deactivated' },
    { label: 'TÀI KHOẢN BỊ KHÓA', value: stats?.lockedUsers ?? 0, icon: Lock, color: '#f59e0b', desc: 'Đang bị lock' },
    { label: 'PHÒNG BAN', value: stats?.totalDepartments ?? 0, icon: Building, color: '#ec4899', desc: 'Đang hoạt động' },
    { label: 'TEAMS', value: stats?.totalTeams ?? 0, icon: UsersRound, color: colors.info, desc: 'Thuộc các phòng ban' },
    { label: 'NHÂN VIÊN', value: stats?.totalEmployees ?? 0, icon: UserPlus, color: colors.warning, desc: 'Hồ sơ HR' },
    { label: 'AUDIT 24H', value: stats?.recentAuditCount ?? 0, icon: FileText, color: '#14b8a6', desc: 'Hoạt động mới' },
  ], [stats, colors]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.innerPadding}>
          <SGSkeleton width="50%" height={28} variant="text" style={{ marginBottom: 8 }} />
          <SGSkeleton width="70%" height={16} variant="text" style={{ marginBottom: 32 }} />
          <View style={styles.skeletonGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <SGSkeleton key={i} width="100%" height={140} borderRadius={20} style={{ flex: 1, minWidth: 160 }} />
            ))}
          </View>
          <SGSkeleton width="100%" height={180} borderRadius={20} style={{ marginTop: 24 }} />
          <View style={styles.skeletonRow}>
            <SGSkeleton width="100%" height={240} borderRadius={20} style={{ flex: 1 }} />
            <SGSkeleton width="100%" height={240} borderRadius={20} style={{ flex: 1 }} />
          </View>
        </View>
      </View>
    );
  }

  const recentUsers = stats?.recentUsers ?? [];
  const deptDist = stats?.deptDistribution ?? [];
  const roleDist = stats?.roleDistribution ?? [];
  const activityTrend: ActivityTrendItem[] = stats?.activityTrend ?? [];

  const roleLabel = (role: string) => getRoleStyle(role);

  // Health check data
  const healthChecks = health?.checks ?? [];
  const overallStatus = health?.status ?? 'unknown';

  const statusIcon = (status: string) => {
    if (status === 'online') return <Wifi size={13} color={colors.success} strokeWidth={2.5} />;
    if (status === 'degraded') return <Zap size={13} color={colors.warning} strokeWidth={2.5} />;
    return <WifiOff size={13} color={colors.danger} strokeWidth={2.5} />;
  };

  const statusColor = (status: string) => {
    if (status === 'online' || status === 'healthy') return colors.success;
    if (status === 'degraded') return colors.warning;
    return colors.danger;
  };

  const healthStatusType = overallStatus === 'healthy' ? 'success' as const
    : overallStatus === 'degraded' ? 'warning' as const : 'danger' as const;

  // Activity chart data
  const maxActivity = Math.max(...activityTrend.map(d => d.count), 1);

  return (
    <View style={styles.container}>
      <View style={styles.innerPadding}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <SGPageHeader
            icon={<BarChart3 size={24} color={colors.accent} />}
            iconColor={colors.accent}
            title="Tổng quan Hệ thống"
            subtitle="Dữ liệu realtime — cập nhật mỗi 30s"
          />
        </Animated.View>

        {/* Stat Cards */}
        <View style={styles.statGrid}>
          {statCards.map((s, i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(i * 60).duration(400).springify().damping(18)}
              style={styles.staggerCard}
            >
              <SGGradientStatCard
                icon={<s.icon size={18} color={s.color} />}
                label={s.label}
                value={s.value}
                color={s.color}
              />
            </Animated.View>
          ))}
        </View>

        {/* System Health */}
        <Animated.View entering={FadeInDown.delay(500).duration(400).springify()}>
          <SGSection
            title="System Health"
            titleIcon={<Activity size={18} color={statusColor(overallStatus)} />}
            titleColor={statusColor(overallStatus)}
            headerRight={
              <SGStatusBadge
                status={healthStatusType}
                text={overallStatus === 'healthy' ? 'Tất cả hoạt động' : overallStatus === 'degraded' ? 'Hiệu suất giảm' : 'Đang kiểm tra...'}
              />
            }
          >
            <View style={styles.healthGrid}>
              {healthChecks.map((item: any, idx: number) => (
                <View
                  key={idx}
                  style={[
                    styles.healthItem,
                    idx < healthChecks.length - 1 && {
                      borderRightWidth: 1,
                      borderRightColor: colors.border,
                    },
                  ]}
                >
                  <View style={[styles.healthIcon, { backgroundColor: `${statusColor(item.status)}12` }]}>
                    {statusIcon(item.status)}
                  </View>
                  <View>
                    <Text style={[typography.smallBold, { color: colors.text }]}>{item.name}</Text>
                    <View style={styles.healthStatus}>
                      <Text style={[typography.caption, {
                        color: statusColor(item.status),
                        fontWeight: '800',
                        textTransform: 'uppercase',
                      }]}>
                        {item.status}
                      </Text>
                      {item.latency > 0 && (
                        <Text style={[typography.caption, { color: colors.textTertiary }]}>
                          ({item.latency}ms)
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </SGSection>
        </Animated.View>

        {/* Activity Trend Chart (7 days) */}
        {activityTrend.length > 0 && (
          <Animated.View entering={FadeInDown.delay(550).duration(400).springify()}>
            <SGSection
              title="Hoạt động 7 ngày qua"
              titleIcon={<TrendingUp size={18} color="#14b8a6" />}
              titleColor="#14b8a6"
            >
              <View style={styles.chartContainer}>
                {activityTrend.map((d, i) => {
                  const pct = (d.count / maxActivity) * 100;
                  const dayLabel = new Date(d.date).toLocaleDateString('vi', { weekday: 'short' });
                  return (
                    <View key={d.date} style={styles.chartBar}>
                      <Text style={[typography.micro, { color: colors.accent, fontWeight: '800' }]}>
                        {d.count}
                      </Text>
                      <View style={[styles.chartBarTrack, { backgroundColor: colors.bgCard }]}>
                        <Animated.View
                          style={[
                            styles.chartBarFill,
                            {
                              height: `${Math.max(pct, 4)}%` as any,
                              backgroundColor: '#14b8a6',
                            },
                            Platform.OS === 'web' && ({ transition: 'height 0.5s ease' } as any),
                          ]}
                        />
                      </View>
                      <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 4 }]}>
                        {dayLabel}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </SGSection>
          </Animated.View>
        )}

        {/* Role Distribution + Recent Users — side by side */}
        <View style={styles.twoCol}>
          {/* Role Distribution */}
          <Animated.View
            entering={FadeInDown.delay(600).duration(400).springify()}
            style={styles.colFlex}
          >
            <SGSection
              title="Phân bổ vai trò"
              titleIcon={<Shield size={18} color="#8b5cf6" />}
              titleColor="#8b5cf6"
            >
              {roleDist.length === 0 ? (
                <SGEmptyState
                  icon={<Shield size={40} color={colors.textTertiary} strokeWidth={1} />}
                  title="Chưa có dữ liệu"
                  subtitle="Dữ liệu vai trò sẽ hiển thị khi có người dùng"
                />
              ) : (
                <View style={styles.roleList}>
                  {(() => {
                    const maxCount = Math.max(...roleDist.map((x: any) => x.count), 1);
                    return roleDist.map((r: any) => {
                      const pct = (r.count / maxCount) * 100;
                      const rl = roleLabel(r.role);
                      return (
                        <View key={r.role}>
                          <View style={styles.roleHeader}>
                            <View style={styles.roleLabel}>
                              <View style={[styles.roleDot, { backgroundColor: rl.color }]} />
                              <Text style={[typography.smallBold, { color: colors.text }]}>{rl.label}</Text>
                            </View>
                            <Text style={[typography.smallBold, { color: rl.color }]}>{r.count}</Text>
                          </View>
                          <View style={[styles.barBg, { backgroundColor: colors.bgCard }]}>
                            <Animated.View
                              style={[styles.barFill, {
                                width: `${pct}%` as any,
                                backgroundColor: rl.color,
                              }]}
                            />
                          </View>
                        </View>
                      );
                    });
                  })()}
                </View>
              )}
            </SGSection>
          </Animated.View>

          {/* Recent Users */}
          <Animated.View
            entering={FadeInDown.delay(700).duration(400).springify()}
            style={styles.colFlexWide}
          >
            <SGSection
              title="Người dùng mới nhất"
              titleIcon={<Clock size={18} color={colors.accent} />}
              titleColor={colors.accent}
              noPadding
            >
              {recentUsers.length === 0 ? (
                <SGEmptyState
                  icon={<Users size={40} color={colors.textTertiary} strokeWidth={1} />}
                  title="Chưa có user nào"
                  subtitle="Người dùng mới sẽ hiển thị tại đây"
                />
              ) : (
                recentUsers.map((u: any, i: number) => {
                  const r = roleLabel(u.role);
                  const isLocked = u.lockedUntil && new Date(u.lockedUntil) > new Date();
                  return (
                    <View
                      key={u.id}
                      style={[styles.userRow, {
                        borderBottomWidth: i < recentUsers.length - 1 ? 1 : 0,
                        borderBottomColor: colors.border,
                      }]}
                    >
                      <SGAvatar name={u.name || '?'} size="sm" color={r.color} />
                      <View style={styles.userInfo}>
                        <View style={styles.userName}>
                          <Text style={[typography.smallBold, { color: colors.text }]}>{u.name}</Text>
                          {u.isActive === false && (
                            <SGStatusBadge status="danger" text="INACTIVE" size="sm" />
                          )}
                          {isLocked && (
                            <SGStatusBadge status="warning" text="LOCKED" size="sm" />
                          )}
                        </View>
                        <Text style={[typography.caption, { color: colors.textSecondary }]}>{u.email}</Text>
                        {/* Last login info */}
                        {u.lastLoginAt && (
                          <Text style={[typography.caption, { color: colors.textTertiary, marginTop: 1 }]}>
                            🕐 {formatRelativeDate(u.lastLoginAt)}{u.loginCount ? ` · ${u.loginCount} lần` : ''}
                          </Text>
                        )}
                      </View>
                      <View style={[styles.roleBadge, { backgroundColor: `${r.color}12` }]}>
                        <Text style={[typography.caption, { color: r.color, fontWeight: '800' }]}>{r.label}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </SGSection>
          </Animated.View>
        </View>

        {/* Department Distribution */}
        <Animated.View entering={FadeInDown.delay(800).duration(400).springify()}>
          <SGSection
            title="Phân bổ nhân sự theo Phòng ban"
            titleIcon={<Building size={18} color="#ec4899" />}
            titleColor="#ec4899"
          >
            {deptDist.length === 0 ? (
              <SGEmptyState
                icon={<Building size={40} color={colors.textTertiary} strokeWidth={1} />}
                title="Chưa có phòng ban nào"
                subtitle="Tạo phòng ban trong mục Cấu hình Tổ chức"
              />
            ) : (
              <View style={styles.deptGrid}>
                {(() => {
                  const maxEmp = Math.max(...deptDist.map((x: any) => x._count?.employees ?? 0), 1);
                  return deptDist.map((d: any) => {
                    const empCount = d._count?.employees ?? 0;
                    const teamCount = d._count?.teams ?? 0;
                    const pct = (empCount / maxEmp) * 100;
                    return (
                      <View key={d.id} style={styles.deptItem}>
                        <View style={styles.deptHeader}>
                          <View style={styles.deptLabel}>
                            <Text style={[typography.smallBold, { color: colors.text }]}>{d.name}</Text>
                            <Text style={[typography.caption, { color: colors.textTertiary }]}>({d.code})</Text>
                          </View>
                          <View style={styles.deptCounts}>
                            <Text style={[typography.caption, { color: '#ec4899', fontWeight: '700' }]}>{empCount} NV</Text>
                            <Text style={[typography.caption, { color: colors.info, fontWeight: '700' }]}>{teamCount} team</Text>
                          </View>
                        </View>
                        <View style={[styles.barBg, { backgroundColor: colors.bgCard }]}>
                          <View style={[styles.barFill, {
                            width: `${pct}%` as any,
                            backgroundColor: '#ec4899',
                          }]} />
                        </View>
                      </View>
                    );
                  });
                })()}
              </View>
            )}
          </SGSection>
        </Animated.View>
      </View>

      {/* Tier 4: Advanced Dashboard Widgets */}
      <Animated.View entering={FadeInDown.delay(600).duration(400)}>
        <UserGrowthChart />
      </Animated.View>

      <View style={styles.twoCol}>
        <Animated.View entering={FadeInDown.delay(650).duration(400)} style={styles.colFlex}>
          <SecurityScoreCard />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(700).duration(400)} style={styles.colFlexWide}>
          <LoginCalendar />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerPadding: { padding: spacing['2xl'] - 4, gap: spacing.lg, paddingBottom: 120 },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  skeletonRow: { flexDirection: 'row', gap: 20, marginTop: 24 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  staggerCard: { flex: 1, minWidth: 220 },
  statValue: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  healthGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  healthItem: { flex: 1, minWidth: 180, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  healthIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  healthStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  // Activity chart
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, height: 160, alignItems: 'flex-end' },
  chartBar: { flex: 1, alignItems: 'center', gap: 4 },
  chartBarTrack: { width: '100%', height: 120, borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  chartBarFill: {
    width: '100%', borderRadius: 8,
    ...(Platform.OS === 'web' ? { transition: 'height 0.5s ease' } : {}),
  },
  twoCol: { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  colFlex: { flex: 1, minWidth: 300 },
  colFlexWide: { flex: 1, minWidth: 340 },
  roleList: { gap: 14 },
  roleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  roleLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roleDot: { width: 10, height: 10, borderRadius: 3 },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: {
    height: '100%' as any, borderRadius: 4,
    ...(Platform.OS === 'web' ? { transition: 'width 0.4s ease' } : {}),
  },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing['2xl'], paddingVertical: 14,
  },
  userInfo: { flex: 1 },
  userName: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  deptGrid: { gap: 14, flexDirection: 'row', flexWrap: 'wrap' },
  deptItem: { flex: 1, minWidth: 280 },
  deptHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  deptLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deptCounts: { flexDirection: 'row', gap: 10 },
});
