import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Radar, Skull, Activity, Focus } from 'lucide-react-native';
import { useGetAuditAnalytics } from '../../application/hooks/useAdminQueries';

export const AuditAnalyticsScreen = () => {
  const { data: analytics } = useGetAuditAnalytics(30);

  return (
    <LinearGradient colors={['#020617', '#0F172A']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <Radar color="#F43F5E" size={28} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">Threat Radar</Text>
            <Text variant="body2" color="#F43F5E">30-Day Audit Log Analytics</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.grid}>
          <BlurView intensity={60} tint="dark" style={[styles.kpiCard, { borderColor: 'rgba(244, 63, 94, 0.2)' }]}>
            <Skull size={24} color="#F43F5E" />
            <Text variant="body2" color="#94A3B8" style={{marginTop: 8}}>Error Rate</Text>
            <Text variant="h3" color="#F8FAFC" weight="bold">{analytics?.errorRate}%</Text>
          </BlurView>
          
          <BlurView intensity={60} tint="dark" style={[styles.kpiCard, { borderColor: 'rgba(56, 189, 248, 0.2)' }]}>
            <Activity size={24} color="#38BDF8" />
            <Text variant="body2" color="#94A3B8" style={{marginTop: 8}}>Total Logs</Text>
            <Text variant="h3" color="#F8FAFC" weight="bold">{Number(analytics?.totalLogs).toLocaleString()}</Text>
          </BlurView>
        </View>

        <Text variant="h3" color="#F43F5E" style={styles.sectionTitle}>// TOP_ACTIVE_IDENTITIES</Text>
        <View style={styles.terminal}>
           {analytics?.topUsers?.map((u: any, idx: number) => (
             <View key={idx} style={styles.terminalRow}>
               <Text variant="caption" color="#64748B" style={{fontFamily: 'monospace', width: 24}}>
                 {(idx + 1).toString().padStart(2, '0')}
               </Text>
               <Text variant="caption" color="#F8FAFC" style={{fontFamily: 'monospace', flex: 1}}>
                 {u.userName}
               </Text>
               <Text variant="caption" color="#F43F5E" style={{fontFamily: 'monospace'}}>
                 {u.count} reqs
               </Text>
             </View>
           ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(244, 63, 94, 0.2)' },
  content: { padding: 16 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  kpiCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sectionTitle: { marginBottom: 16, fontFamily: 'monospace' },
  terminal: { padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.8)', borderWidth: 1, borderColor: '#334155' },
  terminalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 8 }
});
