/**
 * AdminDashboard — Real-time system overview
 * Shows: total users, departments, teams, positions, recent users, dept distribution
 */
import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Platform } from 'react-native';
import {
  Users, Building, Briefcase, UsersRound, UserPlus, BarChart3, Clock,
} from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { useAdminStats } from '../hooks/useAdmin';

export function AdminDashboard() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 120 }}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ color: cSub, marginTop: 12, fontSize: 14, fontWeight: '600' }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  const statCards = [
    { label: 'NGƯỜI DÙNG', value: stats?.totalUsers ?? 0, icon: Users, color: '#6366f1', desc: 'Tài khoản hệ thống' },
    { label: 'PHÒNG BAN', value: stats?.totalDepartments ?? 0, icon: Building, color: '#ec4899', desc: 'Đang hoạt động' },
    { label: 'TEAMS', value: stats?.totalTeams ?? 0, icon: UsersRound, color: '#3b82f6', desc: 'Thuộc các phòng ban' },
    { label: 'CHỨC VỤ', value: stats?.totalPositions ?? 0, icon: Briefcase, color: '#8b5cf6', desc: 'Đã cấu hình' },
    { label: 'NHÂN VIÊN', value: stats?.totalEmployees ?? 0, icon: UserPlus, color: '#10b981', desc: 'Hồ sơ HR' },
  ];

  const recentUsers = stats?.recentUsers ?? [];
  const deptDist = stats?.deptDistribution ?? [];

  const roleLabels: Record<string, { label: string; color: string }> = {
    admin: { label: 'Admin', color: '#ef4444' },
    hr: { label: 'HR', color: '#ec4899' },
    employee: { label: 'Nhân viên', color: '#6366f1' },
    sales: { label: 'Sales', color: '#3b82f6' },
    ceo: { label: 'CEO', color: '#f59e0b' },
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 28, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : '#eef2ff', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={24} color="#6366f1" />
          </View>
          <View>
            <Text style={{ ...sgds.typo.h2, color: cText }}>Tổng quan Hệ thống</Text>
            <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Dữ liệu realtime — cập nhật mỗi 30s</Text>
          </View>
        </View>

        {/* Stat Cards */}
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          {statCards.map((s, i) => (
            <View key={i} style={{
              flex: 1, minWidth: 180, padding: 22, borderRadius: 20,
              backgroundColor: cardBg, borderWidth: 1, borderColor,
              ...(Platform.OS === 'web' ? { transition: 'all 0.2s ease' } : {}),
            } as any}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={20} color={s.color} />
                </View>
                <View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: cSub, letterSpacing: 1 }}>{s.label}</Text>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: `${cSub}80`, marginTop: 1 }}>{s.desc}</Text>
                </View>
              </View>
              <Text style={{ fontSize: 36, fontWeight: '900', color: cText }}>{s.value}</Text>
            </View>
          ))}
        </View>

        {/* Two columns */}
        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          {/* Recent Users */}
          <View style={{ flex: 1, minWidth: 340, borderRadius: 20, backgroundColor: cardBg, borderWidth: 1, borderColor, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, borderBottomWidth: 1, borderBottomColor: borderColor }}>
              <Clock size={16} color="#6366f1" />
              <Text style={{ fontSize: 15, fontWeight: '800', color: cText }}>Người dùng mới nhất</Text>
            </View>
            {recentUsers.length === 0 ? (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>Chưa có user nào</Text>
              </View>
            ) : (
              recentUsers.map((u: any, i: number) => {
                const r = roleLabels[u.role] || { label: u.role, color: '#64748b' };
                return (
                  <View key={u.id} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                    paddingHorizontal: 20, paddingVertical: 14,
                    borderBottomWidth: i < recentUsers.length - 1 ? 1 : 0, borderBottomColor: borderColor,
                  }}>
                    <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: `${r.color}12`, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: r.color }}>{u.name?.charAt(0)?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{u.name}</Text>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: cSub }}>{u.email}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: `${r.color}12` }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: r.color }}>{r.label}</Text>
                    </View>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: cSub }}>
                      {new Date(u.createdAt).toLocaleDateString('vi')}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {/* Department Distribution */}
          <View style={{ flex: 1, minWidth: 340, borderRadius: 20, backgroundColor: cardBg, borderWidth: 1, borderColor, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, borderBottomWidth: 1, borderBottomColor: borderColor }}>
              <Building size={16} color="#ec4899" />
              <Text style={{ fontSize: 15, fontWeight: '800', color: cText }}>Phân bổ nhân sự theo Phòng ban</Text>
            </View>
            {deptDist.length === 0 ? (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>Chưa có phòng ban nào</Text>
              </View>
            ) : (
              <View style={{ padding: 20, gap: 14 }}>
                {deptDist.map((d: any) => {
                  const empCount = d._count?.employees ?? 0;
                  const teamCount = d._count?.teams ?? 0;
                  const maxEmp = Math.max(...deptDist.map((x: any) => x._count?.employees ?? 0), 1);
                  const pct = (empCount / maxEmp) * 100;
                  return (
                    <View key={d.id}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{d.name}</Text>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: cSub }}>({d.code})</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#ec4899' }}>{empCount} NV</Text>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#3b82f6' }}>{teamCount} team</Text>
                        </View>
                      </View>
                      <View style={{ height: 8, borderRadius: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', overflow: 'hidden' }}>
                        <View style={{
                          height: '100%', borderRadius: 4, width: `${pct}%`,
                          backgroundColor: '#ec4899',
                          ...(Platform.OS === 'web' ? { transition: 'width 0.4s ease' } : {}),
                        } as any} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
