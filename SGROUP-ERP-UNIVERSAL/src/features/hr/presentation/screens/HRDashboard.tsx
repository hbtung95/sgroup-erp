import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, Calendar, Banknote, Briefcase, TrendingUp } from 'lucide-react-native';
import { useGetEmployees, useGetLeaves, useGetPayroll } from '../../application/hooks/useHRQueries';

// SGDS - Custom components assumption (SGroup Design System)
import { SGCard } from '../../../../shared/ui/SGCard';

export const HRDashboard = () => {
  const { data: employees, isLoading: loadingEmps } = useGetEmployees();
  const { data: leaves, isLoading: loadingLeaves } = useGetLeaves({ status: 'PENDING' });
  const { data: payroll, isLoading: loadingPayroll } = useGetPayroll('2026-03');

  const stats = [
    { title: 'Total Employees', value: employees?.total || 0, icon: Users, color: ['#4F46E5', '#7C3AED'] },
    { title: 'Pending Leaves', value: leaves?.total || 0, icon: Calendar, color: ['#F59E0B', '#EF4444'] },
    { title: 'Payroll This Month', value: payroll?.length || 0, icon: Banknote, color: ['#10B981', '#059669'] },
    { title: 'Open Positions', value: 5, icon: Briefcase, color: ['#3B82F6', '#2563EB'] },
  ];

  return (
    <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header - Neo Glassmorphism */}
        <View style={styles.header}>
          <Text variant="h1" weight="bold" color="#1E293B">
            HR Analytics
          </Text>
          <Text variant="body2" color="#64748B">
            Overview of company personnel & performance
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.grid}>
          {stats.map((stat, i) => (
            <BlurView intensity={80} tint="light" style={styles.glassCard} key={i}>
              <LinearGradient colors={stat.color} style={styles.iconWrapper}>
                <stat.icon size={24} color="#FFF" />
              </LinearGradient>
              <View style={styles.cardContent}>
                <Text variant="h2" weight="bold" color="#0F172A">
                  {loadingEmps || loadingLeaves || loadingPayroll ? '...' : stat.value}
                </Text>
                <Text variant="caption" color="#64748B">
                  {stat.title}
                </Text>
              </View>
            </BlurView>
          ))}
        </View>

        {/* Recent Actions List */}
        <SGCard style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text variant="h3" weight="bold">Action Required</Text>
          </View>
          {leaves?.items?.slice(0, 3).map((leave: any) => (
            <View key={leave.id} style={styles.listItem}>
              <View style={styles.avatarPlaceholder} />
              <View style={styles.itemInfo}>
                <Text variant="body1" weight="bold">{leave.employee?.fullName}</Text>
                <Text variant="body2" color="#64748B">Requested {leave.totalDays} days of leave</Text>
              </View>
              <TouchableOpacity style={styles.approveBtn}>
                <Text variant="button" color="#FFF">Review</Text>
              </TouchableOpacity>
            </View>
          ))}
        </SGCard>

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { marginBottom: 32 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  glassCard: {
    width: '47%',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  iconWrapper: {
    width: 48, height: 48, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16
  },
  cardContent: { gap: 4 },
  listCard: { padding: 0, borderRadius: 24, overflow: 'hidden' },
  listHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  listItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#F8FAFC'
  },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', marginRight: 12 },
  itemInfo: { flex: 1 },
  approveBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
});
