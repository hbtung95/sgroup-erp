import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet } from 'lucide-react-native';
import { useGetDepartmentPulse } from '../../application/hooks/useBdhQueries';

export const OverviewFinance = () => {
  const { data } = useGetDepartmentPulse('FINANCE');

  return (
    <LinearGradient colors={['#1F2937', '#111827']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <Wallet color="#10B981" size={28} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">Finance Sector Pulse</Text>
            <Text variant="body2" color="#10B981">Cashflow & Ledger Overview</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.centerBox}>
           <Text variant="h2" color="#94A3B8">Live Connection Established</Text>
           <Text variant="body2" color="#64748B" style={{marginTop: 8}}>Finance data stream is operational: {data?.status}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(16, 185, 129, 0.2)' },
  content: { padding: 16, flex: 1, justifyContent: 'center' },
  centerBox: { alignItems: 'center', opacity: 0.5 }
});
