/**
 * RecruitmentScreen — HR Applicant Tracking System (ATS)
 * Features: Job postings, candidate pipelines, interview scheduling
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { UserPlus, Briefcase, Clock, CheckCircle, Search, Filter, MoreHorizontal, UserCog, Users } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../shared/ui/components';
import type { HRRole } from '../HRSidebar';

// Mock Data
const MOCK_JOBS = [
  { id: '1', title: 'Senior React Native Dev', dept: 'IT', type: 'Full-time', location: 'Hà Nội', candidates: 24, status: 'OPEN' },
  { id: '2', title: 'Sales Executive', dept: 'Kinh Doanh', type: 'Full-time', location: 'HCM', candidates: 45, status: 'OPEN' },
  { id: '3', title: 'Digital Marketing Spec.', dept: 'Marketing', type: 'Full-time', location: 'Đà Nẵng', candidates: 12, status: 'URGENT' },
  { id: '4', title: 'HR Manager', dept: 'Nhân sự', type: 'Full-time', location: 'Hà Nội', candidates: 8, status: 'CLOSED' },
];

const MOCK_CANDIDATES = [
  { id: '1', name: 'Lê Thế Tuấn', job: 'Senior React Native Dev', source: 'LinkedIn', date: '15/03/2026', stage: 'NEW', rating: '-' },
  { id: '2', name: 'Nguyễn Thị Hương', job: 'Sales Executive', source: 'Facebook', date: '14/03/2026', stage: 'INTERVIEW', rating: '8/10' },
  { id: '3', name: 'Trần Đại Nghĩa', job: 'Digital Marketing Spec.', source: 'Referral', date: '12/03/2026', stage: 'OFFERRED', rating: '9/10' },
  { id: '4', name: 'Phạm Hương Giang', job: 'Senior React Native Dev', source: 'TopCV', date: '10/03/2026', stage: 'REJECTED', rating: '5/10' },
];

const STAGE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  NEW: { bg: '#eff6ff', text: '#3b82f6', label: 'MỚI ỨNG TUYỂN' },
  INTERVIEW: { bg: '#fef3c7', text: '#d97706', label: 'PHỎNG VẤN' },
  OFFERRED: { bg: '#dcfce7', text: '#16a34a', label: 'ĐÃ OFFER' },
  REJECTED: { bg: '#fee2e2', text: '#dc2626', label: 'TỪ CHỐI' },
};

export function RecruitmentScreen({ userRole }: { userRole?: HRRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const COLUMNS: any = [
    { key: 'name', title: 'ỨNG VIÊN', flex: 1.5, render: (v: any, row: any) => (
      <View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{v}</Text>
        <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>Từ: {row.source}</Text>
      </View>
    ) },
    { key: 'job', title: 'VỊ TRÍ ỨNG TUYỂN', flex: 1.5, render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '600', color: cText }}>{v}</Text> },
    { key: 'date', title: 'NGÀY NỘP', flex: 1, render: (v: any) => <Text style={{ fontSize: 12, color: cSub }}>{v}</Text> },
    { key: 'rating', title: 'ĐÁNH GIÁ', flex: 0.8, align: 'center', render: (v: any) => (
      <Text style={{ fontSize: 14, fontWeight: '900', color: v.startsWith('9') || v.startsWith('8') ? '#10b981' : '#f59e0b' }}>{v}</Text>
    ) },
    { key: 'stage', title: 'TRẠNG THÁI', flex: 1, align: 'center', render: (v: any) => {
      const s = STAGE_CONFIG[v] || { bg: '#f1f5f9', text: '#64748b', label: v };
      return (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: s.bg, alignSelf: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: s.text }}>{s.label}</Text>
        </View>
      );
    } },
    { key: 'actions', title: '', flex: 0.5, align: 'right', render: () => (
      <TouchableOpacity style={{ padding: 6 }}>
        <MoreHorizontal size={16} color={cSub} />
      </TouchableOpacity>
    ) }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 28, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: '#f59e0b20', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={24} color="#f59e0b" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Tuyển dụng (ATS)</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Quản lý tin tuyển dụng & Hồ sơ ứng viên</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={{
              backgroundColor: '#f59e0b', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>TẠO TIN TUYỂN DỤNG</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'VỊ TRÍ ĐANG TUYỂN', val: '3', unit: 'jobs', icon: Briefcase, color: '#f59e0b' },
            { label: 'TỔNG CV MỚI (THÁNG)', val: '89', unit: 'CVs', icon: UserPlus, color: '#3b82f6' },
            { label: 'ĐANG PHỎNG VẤN', val: '14', unit: 'người', icon: Clock, color: '#8b5cf6' },
            { label: 'NHẬN VIỆC (THÁNG)', val: '5', unit: 'người', icon: CheckCircle, color: '#10b981' },
          ].map((s, i) => (
            <View key={i} style={{
              flex: 1, minWidth: 200, padding: 22, borderRadius: 20,
              backgroundColor: cardBg, borderWidth: 1, borderColor,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={20} color={s.color} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: cSub, flex: 1 }}>{s.label}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>{s.val}</Text>
                {s.unit ? <Text style={{ fontSize: 14, fontWeight: '700', color: cSub }}>{s.unit}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Active Jobs Horizon List (Optional - can just use simple cards) */}
        <View>
          <Text style={{ fontSize: 16, fontWeight: '800', color: cText, marginBottom: 16 }}>Vị trí đang mở</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {MOCK_JOBS.map(job => (
              <View key={job.id} style={{
                width: 280, padding: 20, borderRadius: 20,
                backgroundColor: cardBg, borderWidth: 1, borderColor,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: job.status === 'OPEN' ? '#dcfce7' : job.status === 'URGENT' ? '#fee2e2' : '#f1f5f9' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: job.status === 'OPEN' ? '#16a34a' : job.status === 'URGENT' ? '#dc2626' : '#64748b' }}>
                      {job.status}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>{job.location}</Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: cText, marginBottom: 4 }}>{job.title}</Text>
                <Text style={{ fontSize: 13, color: cSub, marginBottom: 16 }}>{job.dept} • {job.type}</Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: borderColor }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Users size={14} color={cSub} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: cSub }}>{job.candidates} CVs</Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#3b82f6' }}>Xem chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Candidates Table */}
        <View style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>Hồ sơ ứng viên mới nhất</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: cardBg, borderWidth: 1, borderColor, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Search size={16} color={cSub} />
                <Text style={{ color: cSub, fontSize: 13 }}>Tìm CV...</Text>
              </View>
            </View>
          </View>
          
          <SGCard variant="glass" noPadding>
            <SGTable 
              columns={COLUMNS} 
              data={MOCK_CANDIDATES} 
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          </SGCard>
        </View>

      </ScrollView>
    </View>
  );
}
