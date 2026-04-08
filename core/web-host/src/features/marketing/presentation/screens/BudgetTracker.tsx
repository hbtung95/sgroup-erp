import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, DollarSign } from 'lucide-react-native';
import { useGetChannelBudgets } from '../../application/hooks/useMarketingQueries';

export const BudgetTracker = () => {
  // Using a simulated exact planId from current year plan
  const { data: budgets } = useGetChannelBudgets('plan-2026-base');

  return (
    <LinearGradient colors={['#FEF2F2', '#FEE2E2']} style={styles.container}>
       <BlurView intensity={50} tint="light" style={styles.header}>
        <Text variant="h1" color="#991B1B" weight="bold">Budget Matrix</Text>
        <Text variant="body2" color="#991B1B">Strategic Allocation 2026</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.list}>
        {budgets?.map((b: any) => (
          <BlurView intensity={90} tint="light" style={styles.card} key={b.id}>
             <View style={styles.row}>
               <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                 <View style={styles.iconBox}>
                    <Briefcase size={20} color="#DC2626" />
                 </View>
                 <View>
                   <Text variant="h3" weight="bold" color="#1E293B">{b.channelLabel || b.channelKey}</Text>
                   <Text variant="caption" color="#64748B">{b.pct}% share of total</Text>
                 </View>
               </View>
               <View style={styles.badge}>
                 <Text variant="caption" weight="bold" color="#B91C1C">Allocated</Text>
               </View>
             </View>

             <View style={styles.metricsRow}>
               <View style={styles.metric}>
                 <Text variant="caption" color="#64748B">Limit</Text>
                 <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                   <DollarSign size={14} color="#DC2626" />
                   <Text variant="h3" weight="bold" color="#DC2626">{Number(b.budgetVnd).toLocaleString()}</Text>
                 </View>
               </View>
               <View style={styles.metric}>
                 <Text variant="caption" color="#64748B">KPI Lead Target</Text>
                 <Text variant="h3" weight="bold">{b.kpiLeadTarget}</Text>
               </View>
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
  card: { padding: 20, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#FFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconBox: { padding: 12, borderRadius: 16, backgroundColor: '#FEE2E2' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#FECACA' },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  metric: { alignItems: 'flex-start' }
});
