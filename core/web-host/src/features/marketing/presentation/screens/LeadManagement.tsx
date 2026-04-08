import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, Hash } from 'lucide-react-native';
import { useGetLeads } from '../../application/hooks/useMarketingQueries';

export const LeadManagement = () => {
  const { data: leads } = useGetLeads();

  return (
    <LinearGradient colors={['#FDF2F8', '#FCE7F3']} style={styles.container}>
       <BlurView intensity={50} tint="light" style={styles.header}>
        <Text variant="h1" color="#BE185D" weight="bold">Lead Directory</Text>
        <Text variant="body2" color="#BE185D">Raw prospect influx</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.list}>
        {leads?.map((l: any) => (
          <BlurView intensity={90} tint="light" style={styles.card} key={l.id}>
            <View style={styles.row}>
               <View>
                 <Text variant="h3" weight="bold" color="#1E293B">{l.name}</Text>
                 <Text variant="caption" color="#64748B">{l.phone || l.email || 'No Contact Info'}</Text>
               </View>
               <View style={styles.badge}><Text variant="caption" color="#BE185D" weight="bold">{l.status}</Text></View>
            </View>
            
            <View style={styles.meta}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <Hash size={14} color="#94A3B8" />
                <Text variant="caption" color="#64748B">{l.source}</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <UserPlus size={14} color="#94A3B8" />
                <Text variant="caption" color="#64748B">{l.campaign?.name || 'Organic'}</Text>
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
  list: { padding: 16, gap: 12 },
  card: { padding: 20, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#FFF' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(190, 24, 93, 0.1)' },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }
});
