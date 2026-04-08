import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Clapperboard, FileText, CalendarCheck } from 'lucide-react-native';
import { useGetContents } from '../../application/hooks/useMarketingQueries';

export const ContentCalendar = () => {
  const { data: contents } = useGetContents();

  const getIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
      case 'REEL':
        return <Clapperboard size={20} color="#8B5CF6" />;
      default:
        return <FileText size={20} color="#3B82F6" />;
    }
  };

  return (
    <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.container}>
       <BlurView intensity={50} tint="light" style={styles.header}>
        <Text variant="h1" color="#1E3A8A" weight="bold">Content Calendar</Text>
        <Text variant="body2" color="#1E3A8A">Omnichannel distribution</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.list}>
        {contents?.map((c: any) => (
          <BlurView intensity={90} tint="light" style={styles.card} key={c.id}>
             <View style={styles.row}>
               <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                 <View style={styles.iconBox}>
                   {getIcon(c.contentType)}
                 </View>
                 <View style={{flex: 1}}>
                   <Text variant="h3" weight="bold" color="#1E293B" numberOfLines={1}>{c.title}</Text>
                   <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4}}>
                     <CalendarCheck size={14} color="#64748B" />
                     <Text variant="caption" color="#64748B">
                       {c.scheduledDate ? new Date(c.scheduledDate).toLocaleDateString() : 'Unscheduled'}
                     </Text>
                   </View>
                 </View>
               </View>
               <View style={[styles.badge, { backgroundColor: c.status === 'PUBLISHED' ? '#D1FAE5' : '#FEF3C7' }]}>
                 <Text variant="caption" weight="bold" color={c.status === 'PUBLISHED' ? '#065F46' : '#92400E'}>{c.status}</Text>
               </View>
             </View>

             <View style={styles.metricsRow}>
               <View style={styles.metric}>
                 <Text variant="caption" color="#64748B">Channel</Text>
                 <Text variant="body2" weight="bold" color="#3B82F6">{c.channel}</Text>
               </View>
               <View style={styles.metric}>
                 <Text variant="caption" color="#64748B">Reach</Text>
                 <Text variant="body2" weight="bold">{c.reach.toLocaleString()}</Text>
               </View>
               <View style={styles.metric}>
                 <Text variant="caption" color="#64748B">Engagement</Text>
                 <Text variant="body2" weight="bold" color="#10B981">{c.engagement.toLocaleString()}</Text>
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
  iconBox: { padding: 12, borderRadius: 16, backgroundColor: '#F1F5F9' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  metric: { alignItems: 'flex-start' }
});
