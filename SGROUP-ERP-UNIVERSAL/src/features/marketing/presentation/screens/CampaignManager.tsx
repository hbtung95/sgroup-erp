import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Megaphone, CalendarClock } from 'lucide-react-native';
import { useGetCampaigns } from '../../application/hooks/useMarketingQueries';

export const CampaignManager = () => {
  const { data: campaigns } = useGetCampaigns();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING': return '#10B981';
      case 'PAUSED': return '#F59E0B';
      default: return '#64748B'; // DRAFT
    }
  };

  return (
    <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.container}>
       <BlurView intensity={50} tint="light" style={styles.header}>
        <Text variant="h1" color="#166534" weight="bold">Campaign Hub</Text>
        <Text variant="body2" color="#166534">Command central for ad placements</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.list}>
        {campaigns?.map((c: any) => (
          <BlurView intensity={90} tint="light" style={styles.card} key={c.id}>
             <View style={styles.row}>
               <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                 <View style={[styles.iconBox, { backgroundColor: getStatusColor(c.status) + '20' }]}>
                    <Megaphone size={20} color={getStatusColor(c.status)} />
                 </View>
                 <View>
                   <Text variant="h3" weight="bold" color="#1E293B">{c.name}</Text>
                   <Text variant="caption" color="#64748B">{c.channel}</Text>
                 </View>
               </View>
               <View style={[styles.badge, { backgroundColor: getStatusColor(c.status) + '20' }]}>
                 <Text variant="caption" weight="bold" color={getStatusColor(c.status)}>{c.status}</Text>
               </View>
             </View>

             <View style={styles.metricsRow}>
               <View style={styles.metric}>
                 <Text variant="caption" color="#64748B">Allocated Budget</Text>
                 <Text variant="body1" weight="bold">{Number(c.budget).toLocaleString()}</Text>
               </View>
               <View style={styles.metric}>
                 <Text variant="caption" color="#64748B">Spend (Real)</Text>
                 <Text variant="body1" weight="bold" color="#EF4444">{Number(c.spend).toLocaleString()}</Text>
               </View>
               <View style={styles.metric}>
                 <Text variant="caption" color="#64748B">Leads</Text>
                 <Text variant="body1" weight="bold" color="#10B981">{c.leads}</Text>
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
  iconBox: { padding: 12, borderRadius: 16 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  metric: { alignItems: 'flex-start' }
});
