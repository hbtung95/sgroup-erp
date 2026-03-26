import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, Target, DollarSign } from 'lucide-react-native';
import { useGetChannelPerformance } from '../../application/hooks/useMarketingQueries';

export const ChannelPerformance = () => {
  // Pass dynamic year/month in production
  const { data: analytics } = useGetChannelPerformance(2026, 3);

  return (
    <LinearGradient colors={['#1E1B4B', '#312E81']} style={styles.container}>
       <BlurView intensity={20} style={styles.header}>
        <Text variant="h1" color="#F8FAFC" weight="bold">CMO Analytics</Text>
        <Text variant="body2" color="#A5B4FC">Heavy ROAS & CPL Aggregation</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.list}>
        {analytics?.map((a: any, idx: number) => (
          <BlurView intensity={60} tint="dark" style={styles.card} key={idx}>
             <View style={styles.row}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                  <PieChart color="#60A5FA" size={24} />
                  <Text variant="h2" weight="bold" color="#F8FAFC">{a.channelKey}</Text>
                </View>
             </View>

             <View style={styles.metricsGrid}>
               <View style={styles.metricBox}>
                 <DollarSign size={16} color="#A5B4FC" style={{marginBottom: 4}} />
                 <Text variant="caption" color="#A5B4FC">Total Spend</Text>
                 <Text variant="h3" color="#F8FAFC" weight="bold">{Number(a.spend).toLocaleString()} đ</Text>
               </View>

               <View style={styles.metricBox}>
                 <Target size={16} color="#34D399" style={{marginBottom: 4}} />
                 <Text variant="caption" color="#A5B4FC">Total Leads</Text>
                 <Text variant="h3" color="#34D399" weight="bold">{a.leads}</Text>
               </View>

               <View style={[styles.metricBox, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                 <Text variant="caption" color="#FCA5A5">CPL (Cost/Lead)</Text>
                 <Text variant="h3" color="#EF4444" weight="bold">{Number(a.cpl).toLocaleString()} đ</Text>
               </View>
               
               <View style={[styles.metricBox, { backgroundColor: 'rgba(52,211,153,0.1)' }]}>
                 <Text variant="caption" color="#6EE7B7">ROAS</Text>
                 <Text variant="h3" color="#10B981" weight="bold">{a.roas}</Text>
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
  card: { padding: 20, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricBox: { width: '47%', padding: 16, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.2)' }
});
