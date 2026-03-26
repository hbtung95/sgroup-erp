/**
 * Payroll — Phiếu lương cá nhân
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CreditCard, Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { sgds } from '../../../../shared/theme/theme';
import { SGCard } from '../../../../shared/ui/components';
import { useAuthStore } from '../../../auth/store/authStore';
import type { SalesRole } from '../../SalesSidebar';

const ROLE_LABELS: Record<string, string> = {
  sales: 'Chuyên viên Kinh doanh',
  team_lead: 'Trưởng nhóm Kinh doanh',
  sales_manager: 'Trưởng phòng Kinh doanh',
  sales_director: 'Giám đốc Kinh doanh',
  sales_admin: 'Admin Kinh doanh',
  ceo: 'Tổng Giám đốc',
  admin: 'Admin Hệ thống',
};

const fmt = (n: number) => n.toLocaleString('vi-VN');

export function Payroll({ userRole }: { userRole?: SalesRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const { user } = useAuthStore();
  const now = new Date();
  const monthLabel = `Tháng ${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const userName = user?.name || 'User';
  const roleLabel = ROLE_LABELS[user?.salesRole || user?.role || 'sales'] || 'Nhân viên';
  const teamName = user?.teamName || 'Team Alpha';

  const INCOME = [
    { label: 'Lương cơ bản', amount: 12000000 },
    { label: 'Phụ cấp ăn trưa', amount: 800000 },
    { label: 'Phụ cấp điện thoại', amount: 500000 },
    { label: 'Hoa hồng (Tháng 02/2026)', amount: 25000000 },
    { label: 'Thưởng hiệu suất', amount: 3000000 },
  ];
  
  const DEDUCTIONS = [
    { label: 'Bảo hiểm XH, BHYT (10.5%)', amount: 1260000 },
    { label: 'Thuế TNCN', amount: 2350000 },
    { label: 'Phạt đi trễ (1 lần)', amount: 100000 },
  ];

  const totalIncome = INCOME.reduce((sum, item) => sum + item.amount, 0);
  const totalDeduction = DEDUCTIONS.reduce((sum, item) => sum + item.amount, 0);
  const netPay = totalIncome - totalDeduction;

  const renderRow = (label: string, amount: number, isDeduction = false) => (
    <View style={styles.row}>
      <Text style={{ fontSize: 14, color: cText }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: isDeduction ? '#ef4444' : cText }}>
        {isDeduction ? '-' : ''}{fmt(amount)} ₫
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#8b5cf620', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={22} color="#8b5cf6" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Phiếu Lương</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>{monthLabel} — {userName}</Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Download size={16} color="#3b82f6" />
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#3b82f6' }}>XUẤT LƯƠNG</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
          {/* Main Content */}
          <View style={{ flex: 2, minWidth: 400 }}>
            <SGCard variant="glass" style={{ padding: 32 }}>
              {/* Income Section */}
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <TrendingUp size={20} color="#22c55e" />
                  <Text style={{ fontSize: 16, fontWeight: '800', color: cText, textTransform: 'uppercase' }}>THU NHẬP</Text>
                </View>
                {INCOME.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {renderRow(item.label, item.amount)}
                    <View style={{ height: 1, backgroundColor: cBorder, marginVertical: 10 }} />
                  </React.Fragment>
                ))}
                <View style={styles.subtotalRow}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>CỘNG THU NHẬP</Text>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#22c55e' }}>{fmt(totalIncome)} ₫</Text>
                </View>
              </View>

              {/* Deduction Section */}
              <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <TrendingDown size={20} color="#ef4444" />
                  <Text style={{ fontSize: 16, fontWeight: '800', color: cText, textTransform: 'uppercase' }}>KHẤU TRỪ</Text>
                </View>
                {DEDUCTIONS.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {renderRow(item.label, item.amount, true)}
                    <View style={{ height: 1, backgroundColor: cBorder, marginVertical: 10 }} />
                  </React.Fragment>
                ))}
                <View style={styles.subtotalRow}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>CỘNG KHẤU TRỪ</Text>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#ef4444' }}>- {fmt(totalDeduction)} ₫</Text>
                </View>
              </View>

              {/* Net Pay Section */}
              <View style={{ padding: 20, borderRadius: 16, backgroundColor: isDark ? 'rgba(34,197,94,0.1)' : '#ecfdf5', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#16a34a', textTransform: 'uppercase', marginBottom: 4 }}>THỰC LÃNH</Text>
                  <Text style={{ fontSize: 12, color: '#15803d' }}>Đã chuyển khoản</Text>
                </View>
                <Text style={{ fontSize: 24, fontWeight: '900', color: '#16a34a' }}>{fmt(netPay)} ₫</Text>
              </View>
            </SGCard>
          </View>

          {/* Sidebar Info */}
          <View style={{ flex: 1, minWidth: 280, gap: 20 }}>
            <SGCard variant="base" style={{ padding: 20 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, textTransform: 'uppercase', marginBottom: 16, letterSpacing: 1 }}>THÔNG TIN NHÂN VIÊN</Text>
              <View style={{ gap: 12 }}>
                <View>
                  <Text style={{ fontSize: 11, color: cSub, marginBottom: 2 }}>Mã NV</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>SG-2699</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: cSub, marginBottom: 2 }}>Họ và Tên</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{userName}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: cSub, marginBottom: 2 }}>Vị trí</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{roleLabel}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: cSub, marginBottom: 2 }}>Team</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{teamName}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: cSub, marginBottom: 2 }}>Email</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: cText }}>{user?.email || 'N/A'}</Text>
                </View>
              </View>
            </SGCard>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  subtotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 16 },
});
