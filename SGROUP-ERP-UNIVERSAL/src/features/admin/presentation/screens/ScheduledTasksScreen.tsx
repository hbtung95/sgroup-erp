import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Play, RotateCw } from 'lucide-react-native';

export const ScheduledTasksScreen = () => {
  const cronJobs = [
    { id: 1, name: 'AuditLog Cleanup', schedule: '0 3 * * *', status: 'ACTIVE', lastRun: 'Today 03:00 AM' },
    { id: 2, name: 'Session Token Expirator', schedule: '0 * * * *', status: 'ACTIVE', lastRun: '1 hour ago' },
    { id: 3, name: 'Nightly Database Backup', schedule: '0 2 * * *', status: 'PAUSED', lastRun: 'Yesterday' }
  ];

  return (
    <LinearGradient colors={['#1E1B4B', '#111827']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <Clock color="#C084FC" size={28} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">Cron Jobs</Text>
            <Text variant="body2" color="#C084FC">Automated System Tasks</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
         {cronJobs.map((job) => (
           <BlurView intensity={40} tint="dark" style={styles.card} key={job.id}>
              <View style={styles.row}>
                 <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                   <View style={styles.iconBox}>
                     <RotateCw size={18} color={job.status === 'ACTIVE' ? '#34D399' : '#64748B'} />
                   </View>
                   <View>
                     <Text variant="h3" color="#F8FAFC" weight="bold">{job.name}</Text>
                     <Text variant="caption" color="#94A3B8" style={{fontFamily: 'monospace'}}>{job.schedule}</Text>
                   </View>
                 </View>
                 
                 <View style={[styles.badge, { backgroundColor: job.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)' }]}>
                   <Text variant="caption" color={job.status === 'ACTIVE' ? '#34D399' : '#94A3B8'} weight="bold">{job.status}</Text>
                 </View>
              </View>

              <View style={styles.footerRow}>
                 <Text variant="caption" color="#64748B">Last run: {job.lastRun}</Text>
                 <View style={{flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8}}>
                   <Play size={12} color="#C084FC" />
                   <Text variant="caption" color="#C084FC">Force Run</Text>
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
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(192, 132, 252, 0.2)' },
  content: { padding: 16, gap: 12 },
  card: { padding: 20, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }
});
