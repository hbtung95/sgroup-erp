import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { useGetDebts } from '../../application/hooks/useFinanceQueries';

export const DebtManagement = () => {
  const { data: debts } = useGetDebts();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return '#10B981';
      case 'PARTIAL': return '#F59E0B';
      case 'OVERDUE': return '#EF4444';
      default: return '#3B82F6'; // UNPAID
    }
  };

  return (
    <LinearGradient colors={['#F8FAFC', '#E2E8F0']} style={styles.container}>
      <BlurView intensity={70} style={styles.header}>
        <Text variant="h1" weight="bold" color="#0F172A">Sổ Quản Lý Công Nợ</Text>
        <Text variant="body2" color="#64748B">Auto-synced from Sales CRM (Double-entry)</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.list}>
        {debts?.map((debt: any) => (
          <BlurView intensity={90} tint="light" style={styles.card} key={debt.id}>
             <View style={styles.cardHeader}>
               <Text variant="h3" weight="bold">{debt.customer?.fullName || 'B2B Client'}</Text>
               <View style={[styles.badge, { backgroundColor: getStatusColor(debt.status) + '20' }]}>
                 {debt.status === 'PAID' ? <CheckCircle2 size={14} color={getStatusColor(debt.status)} /> : 
                  debt.status === 'OVERDUE' ? <AlertCircle size={14} color={getStatusColor(debt.status)} /> :
                  <ShieldAlert size={14} color={getStatusColor(debt.status)} />}
                 <Text variant="caption" color={getStatusColor(debt.status)} weight="bold" style={{marginLeft: 4}}>
                   {debt.status}
                 </Text>
               </View>
             </View>
             
             <View style={styles.row}>
               <Text variant="body2" color="#64748B">Must Receive:</Text>
               <Text variant="body1" weight="bold">{Number(debt.totalAmount).toLocaleString()} VND</Text>
             </View>
             <View style={styles.row}>
               <Text variant="body2" color="#64748B">Collected:</Text>
               <Text variant="body1" weight="bold" color="#10B981">{Number(debt.paidAmount).toLocaleString()} VND</Text>
             </View>
             
             <View style={styles.divider} />
             
             <View style={styles.row}>
               <Text variant="body1" color="#1E293B" weight="bold">Missing:</Text>
               <Text variant="h2" weight="bold" color="#DC2626">{Number(debt.remainingAmount).toLocaleString()}</Text>
             </View>
          </BlurView>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20 },
  list: { padding: 16, gap: 16 },
  card: { padding: 20, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.8)', borderWidth: 1, borderColor: '#FFF' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 12 }
});
