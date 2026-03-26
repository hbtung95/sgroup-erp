import React from 'react';
import { View, ScrollView, StyleSheet } , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react-native';
import { useGetAccounts } from '../../application/hooks/useFinanceQueries';
import { SGCard } from '../../../../shared/ui/SGCard';

export const FinanceDashboard = () => {
  const { data: accounts } = useGetAccounts();

  const totalBalance = accounts?.reduce((acc: number, cur: any) => acc + Number(cur.currentBalance), 0) || 0;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.hero}>
        <BlurView intensity={30} style={styles.heroBlur}>
          <Text variant="h1" color="#F8FAFC">CFO Dashboard</Text>
          <Text variant="body1" color="#94A3B8">Real-time Treasury Treasury</Text>
          
          <View style={styles.balanceContainer}>
            <Text variant="h2" color="#10B981" weight="bold">{totalBalance.toLocaleString()} VND</Text>
            <Text variant="caption" color="#64748B">Total Consolidated Balance</Text>
          </View>
        </BlurView>
      </LinearGradient>

      <View style={styles.content}>
        <Text variant="h3" weight="bold" style={{marginBottom: 16}}>Bank Accounts</Text>
        {accounts?.map((acc: any) => (
          <SGCard style={styles.accountCard} key={acc.id}>
             <View style={styles.accHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                   <View style={styles.iconBox}><Wallet size={20} color="#3B82F6" /></View>
                   <View>
                     <Text variant="body1" weight="bold">{acc.accountName}</Text>
                     <Text variant="caption" color="#64748B">{acc.bankNumber || 'Cash'} • {acc.currency}</Text>
                   </View>
                </View>
                <Text variant="h3" weight="bold" color="#1E293B">{Number(acc.currentBalance).toLocaleString()}</Text>
             </View>
          </SGCard>
        ))}

        <View style={styles.metricsGrid}>
           <BlurView intensity={90} tint="light" style={styles.metricCard}>
             <TrendingUp size={24} color="#10B981" style={{marginBottom: 8}} />
             <Text variant="body2" color="#64748B">Inflow (Mtd)</Text>
             <Text variant="h3" weight="bold">+ 2.4B</Text>
           </BlurView>
           <BlurView intensity={90} tint="light" style={styles.metricCard}>
             <TrendingDown size={24} color="#EF4444" style={{marginBottom: 8}} />
             <Text variant="body2" color="#64748B">Outflow (Mtd)</Text>
             <Text variant="h3" weight="bold">- 850M</Text>
           </BlurView>
        </View>

        <TouchableOpacity style={styles.navButton}>
           <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.gradientBtn}>
             <Text variant="h3" weight="bold" color="#FFF">Mở Bảng Khai Thác Báo Cáo Tài Chính</Text>
           </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  hero: { paddingTop: 60, paddingBottom: 40 },
  heroBlur: { padding: 24, backgroundColor: 'rgba(255,255,255,0.05)' },
  balanceContainer: { marginTop: 24, padding: 20, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20 },
  content: { padding: 16, marginTop: -20 },
  accountCard: { padding: 16, marginBottom: 12 },
  accHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { padding: 12, backgroundColor: '#DBEAFE', borderRadius: 12 },
  metricsGrid: { flexDirection: 'row', gap: 12, marginTop: 12, marginBottom: 20 },
  metricCard: { flex: 1, padding: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#FFF' },
  navButton: { borderRadius: 16, overflow: 'hidden' },
  gradientBtn: { padding: 16, alignItems: 'center' }
});
