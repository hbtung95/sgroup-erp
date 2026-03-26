/**
 * DealRecording — Ghi nhận giao dịch mới + Danh sách deals
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { Plus, Search, Filter, Download, Star, FilterIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../../shared/ui/components';
import type { SalesRole } from '../../SalesSidebar';
import { useGetDeals } from '../../hooks/useSalesOps';

type DealEntry = {
  id: string;
  customer: string;
  phone: string;
  project: string;
  unitCode: string;
  isVip: boolean;
  transactionValue: number;
  commissionExpected: number;
  date: string;
  status: string;
  staff?: string;
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
  const dealsData: DealEntry[] = (rawDeals || []).map((d: any) => ({
    id: d.id,
    customer: d.customerName || '',
    phone: d.customerPhone || '',
    project: d.projectName || '',
    unitCode: d.productCode || '', // Assuming productCode maps to unitCode
    isVip: d.isVip || false, // Assuming a new field for VIP status
    transactionValue: (d.dealValue ?? 0) / 1_000_000_000, // Convert to Tỷ
    commissionExpected: (d.commission ?? 0) / 1_000_000, // Convert to Tr
    date: d.dealDate ? new Date(d.dealDate).toISOString() : '',
    status: d.stage === 'COMPLETED' ? 'thành công' : 'đang xử lý', // Map stage to status
    staff: d.staffName || '',
  }));

  const DEAL_COLUMNS = [
    { key: 'customer', title: 'KHÁCH HÀNG', flex: 1.5, render: (v: string, r: DealEntry) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '900', color: '#64748b' }}>{v.charAt(0)}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 15, fontWeight: '800', color: r.isVip ? '#eab308' : '#1e293b' }}>
            {v} {r.isVip && <Star size={12} color="#eab308" fill="#eab308" style={{marginLeft: 4}} />}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#94a3b8', marginTop: 2 }}>{r.project} <Text style={{ color: '#cbd5e1' }}>•</Text> {r.unitCode}</Text>
        </View>
      </View>
    )},
    { key: 'transactionValue', title: 'GIÁ TRỊ', align: 'right' as const, render: (v: number) => (
      <Text style={{ fontSize: 15, fontWeight: '800', color: '#3b82f6' }}>{v} <Text style={{ fontSize: 12, fontWeight: '700' }}>Tỷ</Text></Text>
    )},
    { key: 'commissionExpected', title: 'HOA HỒNG', align: 'right' as const, render: (v: number) => (
      <Text style={{ fontSize: 15, fontWeight: '800', color: '#10b981' }}>{v} <Text style={{ fontSize: 12, fontWeight: '700' }}>Tr</Text></Text>
    )},
    { key: 'date', title: 'NGÀY KÝ', align: 'center' as const, render: (v: string) => (
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748b' }}>{new Date(v).toLocaleDateString('vi-VN')}</Text>
    )},
    { key: 'status', title: 'TRẠNG THÁI', align: 'center' as const, render: (v: string) => {
      const isSuccess = v === 'thành công';
      return (
        <View style={{ backgroundColor: isSuccess ? '#dcfce7' : '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: isSuccess ? '#bbf7d0' : '#fde68a' }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: isSuccess ? '#16a34a' : '#d97706', letterSpacing: 0.5 }}>{v.toUpperCase()}</Text>
        </View>
      );
    }},
    ...(showStaffColumn ? [{ key: 'staff', title: 'SALES', flex: 1, render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>{v}</Text> }] : []),
  ];

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.6)' : 'rgba(255,255,255,0.85)', borderRadius: 28,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.6)',
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px)', boxShadow: isDark ? '0 12px 32px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.04)' } : {}),
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{scopeLabel}</Text>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Giao Dịch</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>{dealsData.length} giao dịch — Tháng {String(now.getMonth() + 1).padStart(2, '0')}/{now.getFullYear()}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 }}>
              <FilterIcon size={14} color={cSub} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>BỘ LỌC</Text>
            </TouchableOpacity>
            {canCreate && <TouchableOpacity style={{
            shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
            ...(Platform.OS === 'web' ? { transition: 'transform 0.2s', cursor: 'pointer', ':active': { transform: 'scale(0.96)' } } as any : {})
          }}>
            <LinearGradient colors={isDark ? ['#3b82f6', '#1d4ed8'] : ['#60a5fa', '#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{
              flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, gap: 10,
            }}>
              <Plus size={20} color="#fff" strokeWidth={3} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>Ghi Nhận Giao Dịch</Text>
            </LinearGradient>
          </TouchableOpacity>}
          </View>
        </View>

        <SGCard style={cardStyle} noPadding>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>⏳</Text>
              <Text style={{ color: cSub, fontWeight: '700', fontSize: 15 }}>Đang tải giao dịch...</Text>
            </View>
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
