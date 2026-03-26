import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { TerminalSquare, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { useGetAuditLogs } from '../../application/hooks/useAdminQueries';

export const AuditLogScreen = () => {
  const { data: logFeed } = useGetAuditLogs(50, 1);

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
       <BlurView intensity={30} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <TerminalSquare color="#10B981" size={24} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">System TTY</Text>
            <Text variant="body2" color="#10B981">Live Audit Trail (Recent 50 logs)</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.list}>
        {logFeed?.data?.map((log: any) => (
          <BlurView intensity={40} tint="dark" style={[styles.card, { borderLeftColor: log.responseStatus === 'FAILED' ? '#EF4444' : '#10B981' }]} key={log.id}>
             <View style={styles.row}>
               <Text variant="caption" color="#94A3B8" style={{fontFamily: 'monospace'}}>
                 {new Date(log.createdAt).toLocaleString()}
               </Text>
               <View style={styles.methodBadge}>
                 <Text variant="caption" color="#F8FAFC" style={{fontFamily: 'monospace'}}>{log.method}</Text>
               </View>
             </View>

             <View style={{marginTop: 8, marginBottom: 8}}>
               <Text variant="body2" color={log.responseStatus === 'FAILED' ? '#FCA5A5' : '#D1FAE5'} style={{fontFamily: 'monospace'}}>
                 {log.action}
               </Text>
               <Text variant="caption" color="#94A3B8" style={{fontFamily: 'monospace', marginTop: 4}}>
                 {log.resource}
               </Text>
             </View>

             <View style={styles.footerRow}>
               <Text variant="caption" color="#F8FAFC" style={{fontFamily: 'monospace'}}>{log.userName || 'SYSTEM'}</Text>
               <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                 {log.responseStatus === 'FAILED' ? <AlertTriangle size={12} color="#EF4444" /> : <CheckCircle size={12} color="#10B981" />}
                 <Text variant="caption" color={log.responseStatus === 'FAILED' ? '#EF4444' : '#10B981'} style={{fontFamily: 'monospace'}}>
                   {log.responseStatus}
                 </Text>
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
  list: { padding: 16, gap: 10 },
  card: { padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.7)', borderLeftWidth: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  methodBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }
});
