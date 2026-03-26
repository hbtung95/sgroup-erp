/**
 * TeamManagement — CRUD Team Sales + Performance Overview
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, TextInput } from 'react-native';
import { Users, Plus, Edit3, Trash2, TrendingUp, ChevronRight } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGCard, SGButton, SGModal } from '../../../../shared/ui/components';
import type { SalesRole } from '../../SalesSidebar';
import { useTeams } from '../../hooks/useTeams';
import { useAuthStore } from '../../../auth/store/authStore';



const fmt = (n: number) => n.toLocaleString('vi-VN');

export function TeamManagement({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const { user } = useAuthStore();

  // Role-based permissions
  const isDirectorPlus = userRole === 'sales_director' || userRole === 'sales_admin' || userRole === 'ceo';
  const isManagerPlus = isDirectorPlus || userRole === 'sales_manager';
  const canEdit = isDirectorPlus;
  const { teams, staff } = useTeams();

  // Team Lead only sees their own team, Director+ sees all
  const visibleTeams = (userRole === 'team_lead' && user?.teamId)
    ? teams.filter(t => t.id === user.teamId)
    : teams;
  const visibleStaff = (userRole === 'team_lead' && user?.teamId)
    ? staff.filter(s => s.teamId === user.teamId)
    : staff;


  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#8b5cf620', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color="#8b5cf6" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Quản Lý Team Sales</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>{visibleTeams.length} team {userRole === 'team_lead' ? '(team của bạn)' : 'đang hoạt động'}</Text>
            </View>
          </View>
          {canEdit && (
            <SGButton variant="primary" icon="Plus" title="THÊM TEAM" style={{ borderRadius: 12 }} />
          )}
        </View>

        {/* Team Cards Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
          {visibleTeams.map(team => (
            <SGCard variant="glass" key={team.id} style={{ flex: 1, minWidth: 320, padding: 32 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <View>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>{team.name}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: cSub, marginTop: 4 }}>
                    {team.code} · {team.region}
                  </Text>
                </View>
                <View style={{ backgroundColor: '#22c55e20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#22c55e' }}>ACTIVE</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#3b82f620', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: '#3b82f6' }}>TL</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{team.leaderName}</Text>
                <Text style={{ fontSize: 11, color: cSub }}>· Trưởng nhóm</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: cSub }}>NHÂN SỰ</Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: cText, marginTop: 4 }}>{visibleStaff.filter(s => s.teamId === team.id).length}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: cSub }}>KHU VỰC</Text>
                  <Text style={{ fontSize: 18, fontWeight: '900', color: '#8b5cf6', marginTop: 4 }}>{team.region || '—'}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: cSub }}>THỨ TỰ</Text>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: '#22c55e', marginTop: 4 }}>{team.sortOrder}</Text>
                </View>
              </View>

              {canEdit && (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
                  <Pressable style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', gap: 6 }}>
                    <Edit3 size={14} color="#3b82f6" />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#3b82f6' }}>SỬA</Text>
                  </Pressable>
                  <Pressable style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : '#f5f3ff', gap: 6 }}>
                    <ChevronRight size={14} color="#8b5cf6" />
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#8b5cf6' }}>CHI TIẾT</Text>
                  </Pressable>
                </View>
              )}
            </SGCard>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
