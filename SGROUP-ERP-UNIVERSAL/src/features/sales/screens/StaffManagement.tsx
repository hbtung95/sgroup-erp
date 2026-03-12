/**
 * StaffManagement — CRUD Nhân sự Sales
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, Platform, ActivityIndicator } from 'react-native';
import { UserCog, Plus, Star, User } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../shared/ui/components';
import type { SalesRole } from '../SalesSidebar';
import { useGetStaff } from '../hooks/useSalesOps';
import { useAuthStore } from '../../auth/store/authStore';

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function StaffManagement({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const { user } = useAuthStore();

  const { data: rawStaff, isLoading } = useGetStaff();

  // Role-based permissions
  const isDirectorPlus = userRole === 'sales_director' || userRole === 'sales_admin' || userRole === 'ceo';
  const canEdit = isDirectorPlus || userRole === 'sales_manager';

  // Team Lead sees their team, Director+ sees all
  const allStaff = (rawStaff || []) as any[];
  const myStaffRecord = allStaff.find((s: any) => s.email === user?.email || s.fullName === user?.name);
  const myTeamId = myStaffRecord?.teamId || user?.teamId;
  const visibleStaff = (userRole === 'team_lead' && myTeamId)
    ? allStaff.filter((s: any) => s.teamId === myTeamId)
    : allStaff;

  // Map staff to table data
  const staffData = visibleStaff.map((s: any) => ({
    id: s.id,
    code: s.employeeCode || '—',
    name: s.fullName || '',
    team: s.team?.name || '—',
    role: s.role || 'sales',
    deals: s._count?.deals ?? 0,
    gmv: 0,
    target: s.personalTarget || 0,
    status: s.status || 'ACTIVE',
  }));

  const STAFF_COLUMNS: any = [
    { key: 'code', title: 'MÃ NV', width: 80, render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>{v}</Text> },
    { key: 'name', title: 'HỌ TÊN', flex: 2, render: (v: any) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f610', alignItems: 'center', justifyContent: 'center' }}>
          <User size={14} color="#3b82f6" />
        </View>
        <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{v}</Text>
      </View>
    ) },
    { key: 'team', title: 'TEAM', flex: 1.2, render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>{v}</Text> },
    { key: 'role', title: 'VAI TRÒ', flex: 1, render: (v: any) => (
      <View style={{ backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : '#f5f3ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' }}>
        <Text style={{ fontSize: 10, fontWeight: '800', color: '#8b5cf6' }}>{v}</Text>
      </View>
    ) },
    { key: 'deals', title: 'DEALS', width: 70, align: 'center', render: (v: any) => <Text style={{ fontSize: 15, fontWeight: '900', color: cText, textAlign: 'center' }}>{v}</Text> },
    { key: 'gmv', title: 'GMV (TỶ)', flex: 1, align: 'center', render: (v: any) => <Text style={{ fontSize: 15, fontWeight: '900', color: '#3b82f6', textAlign: 'center' }}>{fmt(v)}</Text> },
    { key: 'target', title: 'TARGET', flex: 1, align: 'center', render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '700', color: cSub, textAlign: 'center' }}>{fmt(v)}</Text> },
    { key: 'achievement', title: '% ĐẠT', width: 90, align: 'center', render: (_: any, r: any) => {
      const achievement = r.target > 0 ? Math.round((r.gmv / r.target) * 100) : 0;
      const achColor = achievement >= 100 ? '#22c55e' : achievement >= 70 ? '#f59e0b' : '#ef4444';
      return (
        <View style={{ backgroundColor: achColor + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '900', color: achColor }}>{achievement}%</Text>
        </View>
      );
    } },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#f59e0b20', alignItems: 'center', justifyContent: 'center' }}>
              <UserCog size={22} color="#f59e0b" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Nhân Sự Sales</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>{staffData.length} nhân viên {userRole === 'team_lead' ? '(team của bạn)' : ''}</Text>
            </View>
          </View>
          {canEdit && <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}>
            <Plus size={16} color="#fff" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>THÊM NV</Text>
          </Pressable>}
        </View>

        <SGCard variant="glass" noPadding>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#3b82f6" /></View>
          ) : staffData.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}><Text style={{ fontSize: 40, marginBottom: 12 }}>👥</Text><Text style={{ color: cSub, fontWeight: '700', fontSize: 15 }}>Chưa có nhân viên nào</Text></View>
          ) : (
          <SGTable 
            columns={STAFF_COLUMNS} 
            data={staffData} 
            onRowPress={(row) => console.log('Press staff', row)} 
            style={{ borderWidth: 0, backgroundColor: 'transparent' }}
          />
          )}
        </SGCard>
      </ScrollView>
    </View>
  );
}
