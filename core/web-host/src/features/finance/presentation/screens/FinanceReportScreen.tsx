import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, BarChart3, Activity } from 'lucide-react-native';
import { useGetPnl, useGetBalanceSheet } from '../../application/hooks/useFinanceQueries';

export const FinanceReportScreen = () => {
  const { data: pnl } = useGetPnl();
  const { data: balanceSheet } = useGetBalanceSheet();

  return (
    <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.container}>
      <BlurView intensity={20} style={styles.header}>
        <Text variant="h1" color="#F8FAFC">CFO Analytics</Text>
        <Text variant="body2" color="#94A3B8">Consolidated Financial Statements</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 1. Profit & Loss Section */}
        <BlurView intensity={80} tint="dark" style={styles.card}>
          <View style={styles.cardHeader}>
             <BarChart3 color="#3B82F6" size={24} />
             <Text variant="h2" color="#F8FAFC" style={{marginLeft: 12}}>Báo Cáo Lãi Lỗ (P&L)</Text>
          </View>
          <View style={styles.row}>
            <Text variant="body1" color="#94A3B8">Doanh Thu (Revenue):</Text>
            <Text variant="h3" color="#10B981">{Number(pnl?.totalRevenue || 0).toLocaleString()} đ</Text>
          </View>
          <View style={styles.row}>
            <Text variant="body1" color="#94A3B8">Chi Phí (Expenses):</Text>
            <Text variant="h3" color="#EF4444">- {Number(pnl?.totalExpenses || 0).toLocaleString()} đ</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text variant="h3" color="#F8FAFC">Lợi Nhuận Gộp (Net Income):</Text>
            <Text variant="h2" weight="bold" color={pnl?.netIncome >= 0 ? '#10B981' : '#EF4444'}>
              {Number(pnl?.netIncome || 0).toLocaleString()} đ
            </Text>
          </View>
          <Text variant="caption" color="#64748B" style={{textAlign: 'right', marginTop: 4}}>
            Profit Margin: {pnl?.profitMargin}%
          </Text>
        </BlurView>

        {/* 2. Balance Sheet Section */}
        <BlurView intensity={80} tint="dark" style={styles.card}>
          <View style={styles.cardHeader}>
             <PieChart color="#F59E0B" size={24} />
             <Text variant="h2" color="#F8FAFC" style={{marginLeft: 12}}>Bảng Cân Đối Kế Toán</Text>
          </View>
          
          <Text variant="h3" color="#10B981" style={{marginBottom: 8}}>TỔNG TÀI SẢN</Text>
          <View style={styles.row}>
            <Text variant="body2" color="#94A3B8">Tiền Mặt & Ngân Hàng:</Text>
            <Text variant="body1" color="#F8FAFC">{Number(balanceSheet?.assets?.cashAndEquivalents || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="body2" color="#94A3B8">Phải Thu Khách Hàng:</Text>
            <Text variant="body1" color="#F8FAFC">{Number(balanceSheet?.assets?.accountsReceivable || 0).toLocaleString()}</Text>
          </View>
          <Text variant="h3" weight="bold" color="#F8FAFC" style={{textAlign: 'right', marginBottom: 16}}>
            = {Number(balanceSheet?.assets?.totalAssets || 0).toLocaleString()} đ
          </Text>

          <Text variant="h3" color="#EF4444" style={{marginBottom: 8}}>NGUỒN VỐN (NỢ + VỐN CSH)</Text>
          <View style={styles.row}>
            <Text variant="body2" color="#94A3B8">Nợ Phải Trả:</Text>
            <Text variant="body1" color="#F8FAFC">{Number(balanceSheet?.liabilities?.accountsPayable || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.row}>
            <Text variant="body2" color="#94A3B8">Vốn Chủ Sở Hữu (Equity):</Text>
            <Text variant="body1" color="#F8FAFC">{Number(balanceSheet?.equity?.totalEquity || 0).toLocaleString()}</Text>
          </View>
          <Text variant="h3" weight="bold" color="#F8FAFC" style={{textAlign: 'right'}}>
            = {Number((balanceSheet?.liabilities?.totalLiabilities || 0) + (balanceSheet?.equity?.totalEquity || 0)).toLocaleString()} đ
          </Text>

          <View style={styles.divider} />
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8}}>
            {balanceSheet?.isBalanced ? (
              <><Activity size={16} color="#10B981" /><Text variant="body2" color="#10B981">Balanced (Khoản mục đã khớp)</Text></>
            ) : (
              <><Activity size={16} color="#EF4444" /><Text variant="body2" color="#EF4444">Unbalanced (Lệch số liệu)</Text></>
            )}
          </View>
        </BlurView>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20 },
  content: { padding: 16, gap: 16 },
  card: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 }
});
