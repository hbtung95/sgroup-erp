/**
 * SGROUP ERP — Sales Module
 * Redesigned Staff Management Screen
 */
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Platform, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import {
  UserCog, Plus, User, Users, Target, TrendingUp,
  Search, Filter, Star, Award, ChevronRight, Phone, Mail, Hash,
} from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGCard } from '../../../../shared/ui/components';
import { useAuthStore } from '../../../auth/store/authStore';
import { useGetStaff, useGetTeams } from '../../hooks/useSalesOps';
import { SalesRole } from '../../SalesSidebar';
import { SalesErrorBoundary } from '../../components/SalesErrorBoundary';

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  sales_director: { label: 'GIÁM ĐỐC', color: '#ef4444', bg: '#fee2e2' },
  sales_manager: { label: 'TRƯỞNG PHÒNG', color: '#f59e0b', bg: '#fef3c7' },
  team_lead: { label: 'TRƯỞNG NHÓM', color: '#8b5cf6', bg: '#f3e8ff' },
  sales_admin: { label: 'ADMIN', color: '#64748b', bg: '#f1f5f9' },
  sales: { label: 'NHÂN VIÊN', color: '#3b82f6', bg: '#eff6ff' },
};

const FILTER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'sales_director', label: 'Giám đốc' },
  { key: 'sales_manager', label: 'Trưởng phòng' },
  { key: 'team_lead', label: 'Trưởng nhóm' },
  { key: 'sales', label: 'Nhân viên' },
];

function fmt(num: number) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

function getInitials(name: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function nameToColor(name: string) {
  const c = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return c[sum % c.length];
}

export function StaffManagement({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cBg = isDark ? theme.colors.background : theme.colors.backgroundAlt;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const { user } = useAuthStore();

  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const { data: rawStaff, isLoading } = useGetStaff();
  const { data: rawTeams } = useGetTeams();

  // Role-based permissions
  const isDirectorPlus = userRole === 'sales_director' || userRole === 'sales_admin' || userRole === 'ceo';
  const canEdit = isDirectorPlus || userRole === 'sales_manager';

  // Normalize data safely
  const safeStaffData = Array.isArray(rawStaff) ? rawStaff : Array.isArray((rawStaff as any)?.data) ? (rawStaff as any).data : [];
  const safeTeamData = Array.isArray(rawTeams) ? rawTeams : Array.isArray((rawTeams as any)?.data) ? (rawTeams as any).data : [];

  // Build team lookup map
  const teamMap = useMemo(() => {
    const map: Record<string, string> = {};
    safeTeamData.forEach((t: any) => { if (t.id && t.name) map[t.id] = t.name; });
    return map;
  }, [safeTeamData]);

  // Team Lead sees their team only
  let myTeamId = user?.teamId;
  if (!myTeamId) {
    const myStaffRecord = safeStaffData.find((s: any) => s.email === user?.email || s.fullName === user?.name);
    myTeamId = myStaffRecord?.teamId;
  }
  const visibleStaff = (userRole === 'team_lead' && myTeamId)
    ? safeStaffData.filter((s: any) => s.teamId === myTeamId)
    : safeStaffData;

  // Search + filter
  const filteredStaff = useMemo(() => {
    let list = visibleStaff;
    if (activeFilter !== 'all') {
      list = list.filter((s: any) => s.role === activeFilter);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter((s: any) =>
        (s.fullName || '').toLowerCase().includes(q) ||
        (s.employeeCode || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.team?.name || teamMap[s.teamId] || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [visibleStaff, activeFilter, searchText, teamMap]);

  // Map to display data
  const staffData = filteredStaff.map((s: any) => ({
    id: s.id,
    code: s.employeeCode || '—',
    name: s.fullName || '',
    team: s.team?.name || teamMap[s.teamId] || '—',
    teamId: s.teamId,
    role: s.role || 'sales',
    deals: s._count?.deals ?? 0,
    gmv: 0,
    target: s.personalTarget || 0,
    email: s.email || '',
    phone: s.phone || '',
    status: s.status || 'ACTIVE',
  }));

  // Stats
  const uniqueTeams = new Set(staffData.filter((s: any) => s.teamId).map((s: any) => s.teamId));
  const totalTarget = staffData.reduce((s: number, x: any) => s + x.target, 0);
  const totalDeals = staffData.reduce((s: number, x: any) => s + x.deals, 0);
  const avgTarget = staffData.length > 0 ? totalTarget / staffData.length : 0;

  const statCards = [
    { label: 'Tổng nhân sự', value: visibleStaff.length, icon: Users, color: '#3b82f6' },
    { label: 'Số team', value: uniqueTeams.size, icon: Target, color: '#8b5cf6' },
    { label: 'Tổng deals', value: totalDeals, icon: TrendingUp, color: '#22c55e' },
    { label: 'Target TB', value: fmt(Math.round(avgTarget)), icon: Award, color: '#f59e0b' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: cBg }}>
      <ScrollView contentContainerStyle={{ padding: 28, gap: 20, paddingBottom: 120 }}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{
              width: 52, height: 52, borderRadius: 18,
              backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#fef3c7',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <UserCog size={24} color="#f59e0b" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText, letterSpacing: -0.5 }}>Nhân Sự Sales</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>
                {visibleStaff.length} nhân viên {userRole === 'team_lead' ? '· Team của bạn' : ''}
              </Text>
            </View>
          </View>
          {canEdit && (
            <Pressable style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
            }}>
              <Plus size={16} color="#fff" />
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>THÊM NV</Text>
            </Pressable>
          )}
        </View>

        {/* ── Stat Cards ── */}
        <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
          {statCards.map((sc, i) => {
            const Icon = sc.icon;
            return (
              <View key={i} style={{
                flex: 1, minWidth: 200, borderRadius: 18, padding: 20,
                backgroundColor: cardBg,
                borderWidth: 1, borderColor,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <View style={{
                    width: 42, height: 42, borderRadius: 14,
                    backgroundColor: sc.color + '15',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color={sc.color} />
                  </View>
                </View>
                <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -1 }}>
                  {typeof sc.value === 'number' ? fmt(sc.value) : sc.value}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: cSub, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {sc.label}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── Search & Filter ── */}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <View style={{
            flex: 1, minWidth: 240, flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: cardBg,
            borderWidth: 1, borderColor,
            borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
          }}>
            <Search size={18} color={cSub} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Tìm theo tên, mã NV, email, team..."
              placeholderTextColor={cSub}
              style={{
                flex: 1, fontSize: 14, color: cText,
              }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {FILTER_TABS.map(tab => {
              const active = activeFilter === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveFilter(tab.key)}
                  style={{
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
                    backgroundColor: active ? '#3b82f6' : (isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9'),
                    borderWidth: active ? 0 : 1,
                    borderColor: active ? 'transparent' : borderColor,
                  }}
                >
                  <Text style={{
                    fontSize: 12, fontWeight: '800',
                    color: active ? '#fff' : cSub,
                    letterSpacing: 0.3,
                  }}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Staff Grid ── */}
        {isLoading ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ color: cSub, marginTop: 12, fontWeight: '600' }}>Đang tải nhân sự...</Text>
          </View>
        ) : staffData.length === 0 ? (
          <SGCard variant="glass" style={{ padding: 60, alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>👥</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: cText, marginBottom: 6 }}>Chưa có nhân viên nào</Text>
            <Text style={{ fontSize: 13, color: cSub, textAlign: 'center' }}>
              {searchText ? 'Không tìm thấy kết quả phù hợp' : 'Hãy thêm nhân viên đầu tiên để bắt đầu'}
            </Text>
          </SGCard>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            {staffData.map((staff: any, idx: number) => {
              const roleConf = ROLE_CONFIG[staff.role] || ROLE_CONFIG.sales;
              const avatarColor = nameToColor(staff.name);
              const achievement = staff.target > 0 ? Math.round((staff.gmv / staff.target) * 100) : 0;
              const achColor = achievement >= 100 ? '#22c55e' : achievement >= 70 ? '#f59e0b' : '#ef4444';

              return (
                <Pressable
                  key={staff.id}
                  style={{
                    flex: 1, minWidth: 320, maxWidth: 440,
                    borderRadius: 20, padding: 0, overflow: 'hidden',
                    backgroundColor: cardBg,
                    borderWidth: 1, borderColor,
                  }}
                >
                  {/* Top accent bar */}
                  <View style={{ height: 3, backgroundColor: avatarColor, opacity: 0.6 }} />

                  <View style={{ padding: 22 }}>
                    {/* Avatar + Name + Code */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                      <View style={{
                        width: 50, height: 50, borderRadius: 16,
                        backgroundColor: avatarColor + '18',
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 2, borderColor: avatarColor + '30',
                      }}>
                        <Text style={{ fontSize: 17, fontWeight: '900', color: avatarColor }}>
                          {getInitials(staff.name)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: cText, letterSpacing: -0.3 }}>{staff.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                          <Hash size={11} color={cSub} />
                          <Text style={{ fontSize: 11, fontWeight: '700', color: cSub }}>{staff.code}</Text>
                        </View>
                      </View>
                      {/* Role badge */}
                      <View style={{
                        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
                        backgroundColor: roleConf.bg,
                        borderWidth: 1, borderColor: roleConf.color + '20',
                      }}>
                        <Text style={{ fontSize: 10, fontWeight: '900', color: roleConf.color, letterSpacing: 0.3 }}>
                          {roleConf.label}
                        </Text>
                      </View>
                    </View>

                    {/* Team badge */}
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', gap: 8,
                      paddingBottom: 16, marginBottom: 16,
                      borderBottomWidth: 1, borderBottomColor: borderColor,
                    }}>
                      <View style={{
                        width: 26, height: 26, borderRadius: 8,
                        backgroundColor: '#8b5cf615',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Users size={12} color="#8b5cf6" />
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: staff.team !== '—' ? '#8b5cf6' : cSub }}>
                        {staff.team}
                      </Text>
                      {staff.email ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                          <Mail size={11} color={cSub} />
                          <Text style={{ fontSize: 11, color: cSub }} numberOfLines={1}>{staff.email}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Stats row */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <View style={{ flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: isDark ? 'rgba(59,130,246,0.06)' : '#eff6ff' }}>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: '#3b82f6' }}>{staff.deals}</Text>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: cSub, marginTop: 2 }}>DEALS</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: isDark ? 'rgba(139,92,246,0.06)' : '#f5f3ff' }}>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: '#8b5cf6' }}>{fmt(staff.target)}</Text>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: cSub, marginTop: 2 }}>TARGET</Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: achColor + '08' }}>
                        <Text style={{ fontSize: 20, fontWeight: '900', color: achColor }}>{achievement}%</Text>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: cSub, marginTop: 2 }}>ĐẠT</Text>
                      </View>
                    </View>

                    {/* Progress bar */}
                    <View style={{ marginTop: 14 }}>
                      <View style={{
                        height: 6, borderRadius: 3, overflow: 'hidden',
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                      }}>
                        <View style={{
                          height: 6, borderRadius: 3,
                          width: `${Math.min(achievement, 100)}%` as any,
                          backgroundColor: achColor,
                        }} />
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── Results count ── */}
        {!isLoading && staffData.length > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 12, color: cSub, fontWeight: '600' }}>
              Hiển thị {staffData.length}/{visibleStaff.length} nhân viên
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
