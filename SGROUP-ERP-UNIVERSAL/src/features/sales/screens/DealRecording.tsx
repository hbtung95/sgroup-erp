/**
 * DealRecording — Ghi nhận giao dịch mới + Danh sách deals
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Platform, TextInput, ActivityIndicator } from 'react-native';
import { ShoppingCart, Plus, Filter, ChevronDown } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../shared/ui/components';
import type { SalesRole } from '../SalesSidebar';
import { useGetDeals } from '../hooks/useSalesOps';

const fmt = (n: number) => n.toLocaleString('vi-VN', { minimumFractionDigits: n < 10 ? 1 : 0, maximumFractionDigits: 3 });

const STAGE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  LEAD: { bg: '#f1f5f9', text: '#64748b', label: 'Lead' },
  MEETING: { bg: '#eff6ff', text: '#3b82f6', label: 'Hẹn gặp' },
  BOOKING: { bg: '#f5f3ff', text: '#8b5cf6', label: 'Giữ chỗ' },
  DEPOSIT: { bg: '#fef3c7', text: '#d97706', label: 'Đặt cọc' },
  CONTRACT: { bg: '#ecfdf5', text: '#059669', label: 'Ký HĐ' },
  COMPLETED: { bg: '#dcfce7', text: '#16a34a', label: '✓ Hoàn tất' },
  CANCELLED: { bg: '#fef2f2', text: '#dc2626', label: 'Huỷ' },
};

export function DealRecording({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const isDirector = userRole === 'sales_director' || userRole === 'sales_admin' || userRole === 'ceo';
  const isLeader = userRole === 'team_lead' || userRole === 'sales_manager';
  const showStaffColumn = isDirector || isLeader;
  const scopeLabel = isDirector ? 'TOÀN BỘ GIAO DỊCH' : isLeader ? 'GIAO DỊCH TEAM' : 'GIAO DỊCH CỦA TÔI';
  const canCreate = userRole === 'sales' || userRole === 'sales_manager' || userRole === 'sales_admin';
  const now = new Date();
  const { data: rawDeals, isLoading } = useGetDeals({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const dealsData = (rawDeals || []).map((d: any) => ({
    id: d.id, dealCode: d.dealCode || '', customer: d.customerName || '', phone: d.customerPhone || '',
    project: d.projectName || '', product: d.productCode || '', value: d.dealValue ?? 0,
    feeRate: d.feeRate ?? 0, commission: d.commission ?? 0, stage: d.stage || 'LEAD',
    staff: d.staffName || '', team: d.teamName || '', source: d.source || 'MARKETING',
    date: d.dealDate ? new Date(d.dealDate).toLocaleDateString('vi-VN') : '',
  }));

  const sourceLabels: Record<string, { bg: string; text: string; label: string }> = {
    MARKETING: { bg: '#dbeafe', text: '#2563eb', label: 'MKT' },
    SELF_GEN: { bg: '#fef3c7', text: '#d97706', label: 'TỰ KIẾM' },
    REFERRAL: { bg: '#dcfce7', text: '#16a34a', label: 'GIỚI THIỆU' },
  };

  const DEAL_COLUMNS: any = [
    { key: 'dealCode', title: 'MÃ GD', width: 100, render: (v: any) => <Text style={{ fontSize: 11, fontWeight: '700', color: '#3b82f6' }}>{v}</Text> },
    { key: 'customer', title: 'KHÁCH HÀNG', flex: 1.5, render: (v: any, r: any) => (
      <View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{v}</Text>
        <Text style={{ fontSize: 10, color: cSub, marginTop: 2 }}>{r.phone}</Text>
      </View>
    ) },
    { key: 'project', title: 'DỰ ÁN', flex: 1.5, render: (v: any, r: any) => (
      <View>
        <Text style={{ fontSize: 12, fontWeight: '600', color: cText }}>{v}</Text>
        <Text style={{ fontSize: 10, color: cSub, marginTop: 2 }}>{r.product}</Text>
      </View>
    ) },
    { key: 'value', title: 'GIÁ TRỊ', width: 90, align: 'center', render: (v: any) => <Text style={{ fontSize: 14, fontWeight: '900', color: cText, textAlign: 'center' }}>{fmt(v)} Tỷ</Text> },
    { key: 'feeRate', title: 'PHÍ %', width: 60, align: 'center', render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '700', color: '#8b5cf6', textAlign: 'center' }}>{v}%</Text> },
    { key: 'commission', title: 'HOA HỒNG', width: 90, align: 'center', render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '800', color: '#22c55e', textAlign: 'center' }}>{fmt(v)} Tỷ</Text> },
    { key: 'stage', title: 'TRẠNG THÁI', width: 90, align: 'center', render: (v: any) => {
      const s = STAGE_COLORS[v] || STAGE_COLORS.LEAD;
      return (
        <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: s.bg, alignSelf: 'center' }}>
          <Text style={{ fontSize: 9, fontWeight: '800', color: s.text }}>{s.label}</Text>
        </View>
      );
    } },
    ...(showStaffColumn ? [{ key: 'staff', title: 'SALES', flex: 1, render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>{v}</Text> }] : []),
    { key: 'source', title: 'NGUỒN', width: 70, align: 'center', render: (v: any) => {
      const srcInfo = sourceLabels[v] || sourceLabels.MARKETING;
      return (
        <View style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, backgroundColor: srcInfo.bg, alignSelf: 'center' }}>
          <Text style={{ fontSize: 8, fontWeight: '800', color: srcInfo.text }}>{srcInfo.label}</Text>
        </View>
      );
    } },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#3b82f620', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={22} color="#3b82f6" />
            </View>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{scopeLabel}</Text>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Giao Dịch</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>{dealsData.length} giao dịch — Tháng {String(now.getMonth() + 1).padStart(2, '0')}/{now.getFullYear()}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }}>
              <Filter size={14} color={cSub} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>BỘ LỌC</Text>
            </Pressable>
            {canCreate && <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 }}>
              <Plus size={16} color="#fff" />
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#fff' }}>GHI NHẬN GD</Text>
            </Pressable>}
          </View>
        </View>

        <SGCard variant="glass" noPadding>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#3b82f6" /><Text style={{ color: cSub, marginTop: 12, fontWeight: '600' }}>Đang tải giao dịch...</Text></View>
          ) : dealsData.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center' }}><Text style={{ fontSize: 40, marginBottom: 12 }}>📝</Text><Text style={{ color: cSub, fontWeight: '700', fontSize: 15 }}>Chưa có giao dịch nào</Text></View>
          ) : (
          <SGTable 
            columns={DEAL_COLUMNS} 
            data={dealsData} 
            onRowPress={(row) => console.log('Press deal', row)} 
            style={{ borderWidth: 0, backgroundColor: 'transparent' }}
          />
          )}
        </SGCard>
      </ScrollView>
    </View>
  );
}
