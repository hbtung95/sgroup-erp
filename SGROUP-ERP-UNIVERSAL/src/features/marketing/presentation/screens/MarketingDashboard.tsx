import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, Users, Megaphone, TrendingUp } from 'lucide-react-native';
import { useGetCampaigns } from '../../application/hooks/useMarketingQueries';

export const MarketingDashboard = () => {
  const { data: campaigns } = useGetCampaigns();

  const totalSpend = campaigns?.reduce((acc: number, cur: any) => acc + Number(cur.spend), 0) || 0;
  const totalLeads = campaigns?.reduce((acc: number, cur: any) => acc + Number(cur.leads), 0) || 0;
  const activeCampaigns = campaigns?.filter((c: any) => c.status === 'RUNNING').length || 0;

  return (
    <LinearGradient colors={['#4C1D95', '#2E1065']} style={styles.container}>
      <BlurView intensity={30} style={styles.header}>
        <Text variant="h1" color="#F8FAFC">CMO Dashboard</Text>
        <Text variant="body2" color="#C4B5FD">Marketing Performance Ops</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* KPI Grid */}
        <View style={styles.grid}>
          <BlurView intensity={80} tint="dark" style={styles.kpiCard}>
            <TrendingUp size={24} color="#34D399" />
            <Text variant="body2" color="#A78BFA" style={{marginTop: 8}}>Net Spend</Text>
            <Text variant="h3" color="#F8FAFC" weight="bold">{totalSpend.toLocaleString()}</Text>
          </BlurView>
          
          <BlurView intensity={80} tint="dark" style={styles.kpiCard}>
            <Users size={24} color="#FBBF24" />
            <Text variant="body2" color="#A78BFA" style={{marginTop: 8}}>New Leads</Text>
            <Text variant="h3" color="#F8FAFC" weight="bold">{totalLeads.toLocaleString()}</Text>
          </BlurView>
        </View>

        <View style={styles.grid}>
          <BlurView intensity={80} tint="dark" style={styles.kpiCard}>
            <Megaphone size={24} color="#60A5FA" />
            <Text variant="body2" color="#A78BFA" style={{marginTop: 8}}>Active Campaigns</Text>
            <Text variant="h3" color="#F8FAFC" weight="bold">{activeCampaigns}</Text>
          </BlurView>

          <BlurView intensity={80} tint="dark" style={styles.kpiCard}>
            <Target size={24} color="#F87171" />
            <Text variant="body2" color="#A78BFA" style={{marginTop: 8}}>Avg CPL</Text>
            <Text variant="h3" color="#F8FAFC" weight="bold">
              {totalLeads > 0 ? Math.round(totalSpend / totalLeads).toLocaleString() : 0}
            </Text>
          </BlurView>
        </View>

        {/* Top Active Campaigns */}
        <Text variant="h3" color="#F8FAFC" style={styles.sectionTitle}>Top Perfoming Campaigns</Text>
        {campaigns?.filter((c: any) => c.status === 'RUNNING').map((c: any) => (
          <BlurView intensity={60} tint="dark" style={styles.listCard} key={c.id}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
               <Text variant="body1" color="#F8FAFC" weight="bold">{c.name}</Text>
               <View style={styles.badge}><Text variant="caption" color="#60A5FA">{c.channel}</Text></View>
            </View>
            <View style={{flexDirection: 'row', gap: 16, marginTop: 12}}>
              <View>
                <Text variant="caption" color="#A78BFA">Spend</Text>
                <Text variant="body2" color="#F8FAFC">{Number(c.spend).toLocaleString()}</Text>
              </View>
              <View>
                <Text variant="caption" color="#A78BFA">Leads</Text>
                <Text variant="body2" color="#F8FAFC">{c.leads}</Text>
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
  content: { padding: 16 },
  grid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpiCard: { flex: 1, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sectionTitle: { marginTop: 24, marginBottom: 12 },
  listCard: { padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: 'rgba(96,165,250,0.15)' }
});
