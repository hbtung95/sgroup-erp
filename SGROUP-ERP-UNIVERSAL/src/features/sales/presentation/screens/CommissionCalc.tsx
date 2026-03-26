import React from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { DollarSign, TrendingUp, Gift, Download, Clock, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGButton, SGPlanningSectionTitle } from '../../../../shared/ui/components';
import { useGetCommissionReport } from '../../hooks/useSalesReport';
import type { SalesRole } from '../../SalesSidebar';

type CommissionRecord = {
  id: string;
  project: string;
  customer: string;
  transactionValue: number; // Tỷ VNĐ
  commissionRate: number; // %
  commissionEstimated: number; // Triệu VNĐ
  status: 'PENDING' | 'APPROVED' | 'PAID';
  date: string;
};

const commissions: CommissionRecord[] = [];

export function CommissionCalc({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;

  const isDirector = userRole === 'sales_director' || userRole === 'sales_admin' || userRole === 'ceo';
  const isLeader = userRole === 'team_lead' || userRole === 'sales_manager';
  const scopeLabel = isDirector ? 'HOA HỒNG TOÀN BỘ' : isLeader ? 'HOA HỒNG TEAM' : 'VÍ THU NHẬP CÁ NHÂN';

  const now = new Date();
  const { data: rawData, isLoading } = useGetCommissionReport({ year: now.getFullYear(), month: now.getMonth() + 1 });
  const records: CommissionRecord[] = (rawData || []).map((r: any) => ({
    id: r.id,
    project: r.project || r.projectName || '',
    customer: r.customer || r.customerName || r.staffName || '',
    transactionValue: r.transactionValue ?? r.dealValue ?? 0,
    commissionRate: r.commissionRate ?? 0,
    commissionEstimated: r.commissionEstimated ?? r.commissionAmount ?? 0,
    status: r.status || 'PENDING',
    date: r.date || r.createdAt || '',
  }));

  const totalPaid = records.filter(c => c.status === 'PAID').reduce((sum, c) => sum + c.commissionEstimated, 0);
  const totalPending = records.filter(c => c.status !== 'PAID').reduce((sum, c) => sum + c.commissionEstimated, 0);

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24, padding: 32,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#10b981', textTransform: 'uppercase', marginBottom: 4 }}>{scopeLabel}</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>Hoa Hồng & Thưởng</Text>
          </View>
          <SGButton title="Xuất Báo Cáo" icon={Download as any} style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }} />
        </View>

        {/* Dashboard Overview */}
        <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
          <View style={[cardStyle, { flex: 1, minWidth: 280, backgroundColor: isDark ? '#064e3b20' : '#f0fdf4', borderColor: isDark ? '#064e3b50' : '#bbf7d0' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#10b98120', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={24} color="#10b981" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#34d399' : '#16a34a' }}>ĐÃ THỰC NHẬN</Text>
            </View>
            <Text style={{ fontSize: 48, fontWeight: '900', color: isDark ? '#fff' : '#064e3b', letterSpacing: -1 }}>
              {totalPaid.toLocaleString()} <Text style={{ fontSize: 20, fontWeight: '700' }}>Triệu</Text>
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#a7f3d0' : '#16a34a', marginTop: 8 }}>+12% so với tháng trước</Text>
          </View>

          <View style={[cardStyle, { flex: 1, minWidth: 280, backgroundColor: isDark ? '#78350f20' : '#fffbeb', borderColor: isDark ? '#78350f50' : '#fef08a' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: '#f59e0b20', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} color="#f59e0b" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#fbbf24' : '#d97706' }}>TẠM TÍNH (ĐANG CHỜ)</Text>
            </View>
            <Text style={{ fontSize: 48, fontWeight: '900', color: isDark ? '#fff' : '#78350f', letterSpacing: -1 }}>
              {totalPending.toLocaleString()} <Text style={{ fontSize: 20, fontWeight: '700' }}>Triệu</Text>
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: isDark ? '#fde68a' : '#d97706', marginTop: 8 }}>Sẽ giải ngân khi hoàn tất HĐMB</Text>
          </View>
        </View>

        {/* Transaction History */}
        <View style={cardStyle}>
          <SGPlanningSectionTitle 
            icon={TrendingUp}
            title="Lịch Sử Tính Phí"
            accent="#3b82f6"
            badgeText="BREAKDOWN"
            style={{ marginBottom: 24 }}
          />
          
          <View style={{ gap: 16 }}>
            {isLoading ? (
              <View style={{ padding: 24, alignItems: 'center' }}><ActivityIndicator size="small" color="#3b82f6" /></View>
            ) : records.length === 0 ? (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>💰</Text>
                <Text style={{ color: cSub, fontWeight: '700', fontSize: 15 }}>Chưa có giao dịch hoa hồng</Text>
                <Text style={{ color: cSub, fontSize: 13, marginTop: 4 }}>Dữ liệu sẽ xuất hiện khi có giao dịch hoàn tất</Text>
              </View>
            ) : null}
            {records.map(record => {
              const statusConfig = {
                PAID: { label: 'ĐÃ CHI TRẢ', color: '#10b981', bg: '#dcfce7' },
                APPROVED: { label: 'CHỜ KẾ TOÁN CHI', color: '#3b82f6', bg: '#eff6ff' },
                PENDING: { label: 'TẠM TÍNH (CHƯA HĐMB)', color: '#f59e0b', bg: '#fef3c7' }
              }[record.status];

              return (
                <View key={record.id} style={{ 
                  flexDirection: 'row', alignItems: 'center',
                  paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' 
                }}>
                  <View style={{ flex: 2 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: cText, marginBottom: 4 }}>{record.project} - {record.customer}</Text>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>
                      Giá trị HĐ: <Text style={{ color: cText }}>{record.transactionValue} Tỷ</Text> • 
                      Rate: <Text style={{ color: '#8b5cf6', fontWeight: '800' }}>{record.commissionRate}%</Text> • 
                      {record.date}
                    </Text>
                  </View>
                  
                  <View style={{ flex: 1, alignItems: 'flex-end', gap: 8 }}>
                     <Text style={{ fontSize: 20, fontWeight: '900', color: record.status === 'PAID' ? '#10b981' : (record.status === 'PENDING' ? '#f59e0b' : cText) }}>
                       +{record.commissionEstimated} <Text style={{ fontSize: 12, fontWeight: '700' }}>Tr</Text>
                     </Text>
                     <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: isDark ? `${statusConfig.color}20` : statusConfig.bg }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: statusConfig.color }}>{statusConfig.label}</Text>
                     </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
