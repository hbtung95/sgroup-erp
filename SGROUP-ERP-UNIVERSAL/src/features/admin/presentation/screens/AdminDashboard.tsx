import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldAlert, Users, Fingerprint, Activity } from 'lucide-react-native';
import { useGetAllUsers, useGetFeatureFlags } from '../../application/hooks/useAdminQueries';

export const AdminDashboard = () => {
  const { data: users } = useGetAllUsers();
  const { data: flags } = useGetFeatureFlags();

  const totalUsers = users?.length || 0;
  const activeFlags = flags?.filter((f: any) => f.enabled).length || 0;

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
      {/* Cyber Security Header */}
      <BlurView intensity={20} style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <Fingerprint color="#38BDF8" size={28} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">SYSTEM CORE</Text>
            <Text variant="body2" color="#38BDF8">CTO Command Center (Level 5 Access)</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Security Grid */}
        <View style={styles.grid}>
          <BlurView intensity={60} tint="dark" style={[styles.kpiCard, { borderColor: 'rgba(56, 189, 248, 0.2)' }]}>
            <Activity size={24} color="#38BDF8" />
            <Text variant="body2" color="#94A3B8" style={{marginTop: 8}}>System Status</Text>
            <Text variant="h3" color="#10B981" weight="bold">SECURE_OK</Text>
          </BlurView>
          
          <BlurView intensity={60} tint="dark" style={[styles.kpiCard, { borderColor: 'rgba(99, 102, 241, 0.2)' }]}>
            <Users size={24} color="#818CF8" />
            <Text variant="body2" color="#94A3B8" style={{marginTop: 8}}>Total Identities</Text>
            <Text variant="h3" color="#F8FAFC" weight="bold">{totalUsers}</Text>
          </BlurView>
        </View>

        <View style={styles.grid}>
          <BlurView intensity={60} tint="dark" style={[styles.kpiCard, { borderColor: 'rgba(245, 158, 11, 0.2)' }]}>
             <ShieldAlert size={24} color="#FBBF24" />
             <Text variant="body2" color="#94A3B8" style={{marginTop: 8}}>Active Flags</Text>
             <Text variant="h3" color="#F8FAFC" weight="bold">{activeFlags}</Text>
          </BlurView>

           <BlurView intensity={60} tint="dark" style={[styles.kpiCard, { borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
             <Fingerprint size={24} color="#F87171" />
             <Text variant="body2" color="#94A3B8" style={{marginTop: 8}}>Breach Alerts</Text>
             <Text variant="h3" color="#F87171" weight="bold">0</Text>
          </BlurView>
        </View>

        {/* Live Feed Terminal */}
        <Text variant="h3" color="#38BDF8" style={styles.sectionTitle}>// ACTIVE_FEATURE_GATES</Text>
        <BlurView intensity={40} tint="dark" style={styles.terminal}>
           {flags?.map((f: any, idx: number) => (
             <View key={idx} style={styles.terminalRow}>
               <Text variant="caption" color={f.enabled ? '#10B981' : '#64748B'} style={{fontFamily: 'monospace'}}>
                 [{f.enabled ? 'ON ' : 'OFF'}]
               </Text>
               <Text variant="caption" color="#F8FAFC" style={{fontFamily: 'monospace', marginLeft: 8}}>
                 {f.key}
               </Text>
             </View>
           ))}
        </BlurView>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(56, 189, 248, 0.2)' },
  content: { padding: 16 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpiCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sectionTitle: { marginTop: 24, marginBottom: 16, fontFamily: 'monospace' },
  terminal: { padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.8)', borderWidth: 1, borderColor: '#334155' },
  terminalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }
});
