import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetTransactions } from '../../application/hooks/useFinanceQueries';

export const TransactionList = () => {
  const [type, setType] = useState<string>('');
  const { data: transactions } = useGetTransactions({ type: type || undefined });

  return (
    <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.container}>
      <BlurView intensity={50} tint="light" style={styles.header}>
        <Text variant="h1" weight="bold" color="#166534">Sổ Cái Dòng Tiền</Text>
        <View style={styles.filters}>
          {['', 'INCOME', 'EXPENSE'].map(t => (
            <TouchableOpacity key={t} onPress={() => setType(t)} style={[styles.filterBtn, type === t && styles.activeFilter]}>
              <Text color={type === t ? '#FFF' : '#166534'} weight="bold">{t || 'ALL'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.list}>
        {transactions?.map((tx: any) => (
          <BlurView intensity={90} tint="light" style={styles.card} key={tx.id}>
             <View style={styles.row}>
               <Text variant="body1" weight="bold">{tx.transactionCode}</Text>
               <Text variant="body1" weight="bold" color={tx.type === 'INCOME' ? '#059669' : '#DC2626'}>
                 {tx.type === 'INCOME' ? '+' : '-'}{Number(tx.amount).toLocaleString()}
               </Text>
             </View>
             <Text variant="caption" color="#64748B">{tx.category?.categoryName} • {tx.account?.accountName}</Text>
             <Text variant="caption" color="#94A3B8" style={{marginTop: 8}}>{new Date(tx.paymentDate).toLocaleDateString()}</Text>
          </BlurView>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24 },
  filters: { flexDirection: 'row', gap: 8, marginTop: 16 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(22, 101, 52, 0.1)' },
  activeFilter: { backgroundColor: '#166534' },
  list: { padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#FFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }
});
