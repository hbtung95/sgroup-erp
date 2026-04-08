import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { useGetAgencyOverview } from '../application/hooks/useAgencyQueries';
import { Building2, Award, Briefcase } from 'lucide-react-native';

export const AgencyDashboard = () => {
  const { data, isLoading } = useGetAgencyOverview();

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#3B82F6" /></View>;
  }

  const kpis = [
    { title: 'Total Registered Agencies', value: data?.overview?.totalAgencies || 0, icon: <Building2 color="#3B82F6" size={24} />, color: '#3B82F6' },
    { title: 'Active B2B Contracts', value: data?.overview?.activeContracts || 0, icon: <Briefcase color="#10B981" size={24} />, color: '#10B981' },
    { title: 'Global Network Revenue', value: `${(data?.overview?.networkRevenue || 0).toLocaleString()} ₫`, icon: <Award color="#F59E0B" size={24} />, color: '#F59E0B' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.grid}>
        {kpis.map((kpi, idx) => (
          <BlurView intensity={40} tint="dark" style={[styles.kpiCard, { borderColor: `rgba(${hexToRgb(kpi.color)}, 0.3)` }]} key={idx}>
             <View style={styles.iconBox}>{kpi.icon}</View>
             <Text variant="body2" color="#94A3B8" style={{marginTop: 12}}>{kpi.title}</Text>
             <Text variant="h2" color="#F8FAFC" weight="bold" style={{marginTop: 4}}>{kpi.value}</Text>
          </BlurView>
        ))}
      </View>

      <Text variant="h3" color="#64748B" style={{marginTop: 24, alignSelf: 'center'}}>
         Network Graph Rendering Standing By...
      </Text>
    </ScrollView>
  );
};

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,255,255';
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  kpiCard: { width: '31%', padding: 24, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.5)', minWidth: 250 },
  iconBox: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignSelf: 'flex-start' },
});
