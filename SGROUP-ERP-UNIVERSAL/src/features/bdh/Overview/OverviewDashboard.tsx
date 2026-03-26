import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator } , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Globe, Users, Briefcase, ShoppingCart, Target, Wallet } from 'lucide-react-native';
import { useGetBdhOverview } from '../../application/hooks/useBdhQueries';

export const OverviewDashboard = () => {
  const { data, isLoading } = useGetBdhOverview();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text variant="body2" color="#64748B" style={{marginTop: 12}}>Aggregating Cross-Module Telemetry...</Text>
      </View>
    );
  }

  const kpis = [
    { title: 'Total Workforce', value: data?.overview?.totalEmployees || 0, icon: <Users color="#3B82F6" size={24} />, color: '#3B82F6' },
    { title: 'MTD Revenue', value: `${(data?.overview?.mtdRevenue || 0).toLocaleString()} ₫`, icon: <Wallet color="#10B981" size={24} />, color: '#10B981' },
    { title: 'MTD Expenses', value: `${(data?.overview?.mtdExpenses || 0).toLocaleString()} ₫`, icon: <Wallet color="#F43F5E" size={24} />, color: '#F43F5E' },
    { title: 'Active Projects', value: data?.overview?.activeProjects || 0, icon: <Briefcase color="#8B5CF6" size={24} />, color: '#8B5CF6' },
    { title: 'Sales Pipeline', value: data?.overview?.activeDeals || 0, icon: <ShoppingCart color="#F59E0B" size={24} />, color: '#F59E0B' },
    { title: 'Open Leads', value: data?.overview?.openLeads || 0, icon: <Target color="#06B6D4" size={24} />, color: '#06B6D4' }
  ];

  return (
    <LinearGradient colors={['#0F172A', '#020617']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <Globe color="#3B82F6" size={28} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">Global Command Center</Text>
            <Text variant="body2" color="#3B82F6">Real-Time Aggregated Enterprise Metrics</Text>
          </View>
        </View>
      </BlurView>

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

        <Text variant="h3" color="#F8FAFC" style={{marginBottom: 16, marginTop: 16}}>Live Pulse Stream</Text>
        <BlurView intensity={30} tint="dark" style={styles.terminal}>
           <Text variant="caption" color="#64748B" style={{fontFamily: 'monospace'}}>
             {`> [SYSTEM] Global metrics synchronized at ${new Date(data?.lastUpdated || Date.now()).toLocaleTimeString()}...`}
           </Text>
           <Text variant="caption" color="#10B981" style={{fontFamily: 'monospace'}}>
             {`> [FINANCE] Revenue engine optimal. MTD Input verified.`}
           </Text>
           <Text variant="caption" color="#3B82F6" style={{fontFamily: 'monospace'}}>
             {`> [HR] Payroll matrices standing by.`}
           </Text>
        </BlurView>
      </ScrollView>
    </LinearGradient>
  );
};

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255,255,255';
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(59, 130, 246, 0.2)' },
  content: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  kpiCard: { width: '48%', padding: 20, borderRadius: 16, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  iconBox: { padding: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignSelf: 'flex-start' },
  terminal: { padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.8)', borderWidth: 1, borderColor: '#334155', gap: 8 }
});
