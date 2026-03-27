import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Globe, Users, Briefcase, ShoppingCart, Target, Wallet, Activity } from 'lucide-react-native';
import { useGetBdhOverview } from '../application/hooks/useBdhQueries';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { typography, spacing, radius, sgds } from '../../../shared/theme/theme';
import { SGPageContainer } from '../../../shared/ui/components/SGPageContainer';
import { SGStatCard } from '../../../shared/ui/components/SGStatCard';
import { SGSection } from '../../../shared/ui/components/SGSection';
import { SGLoadingOverlay } from '../../../shared/ui/components/SGLoadingOverlay';

export const OverviewDashboard = () => {
  const { data, isLoading } = useGetBdhOverview();
  const { theme, colors, isDark } = useAppTheme();

  if (isLoading) {
    return <SGLoadingOverlay visible message="Aggregating Cross-Module Telemetry..." />;
  }

  const kpis = [
    { title: 'Total Workforce', value: data?.overview?.totalEmployees || 0, icon: Users, color: colors.brand },
    { title: 'MTD Revenue', value: `${(data?.overview?.mtdRevenue || 0).toLocaleString()} ₫`, icon: Wallet, color: colors.success },
    { title: 'MTD Expenses', value: `${(data?.overview?.mtdExpenses || 0).toLocaleString()} ₫`, icon: Activity, color: colors.danger },
    { title: 'Active Projects', value: data?.overview?.activeProjects || 0, icon: Briefcase, color: colors.purple },
    { title: 'Sales Pipeline', value: data?.overview?.activeDeals || 0, icon: ShoppingCart, color: colors.warning },
    { title: 'Open Leads', value: data?.overview?.openLeads || 0, icon: Target, color: colors.accentCyan }
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(14, 165, 233, 0.15)' : 'rgba(2, 132, 199, 0.1)' }]}>
            <Globe color={colors.brand} size={32} strokeWidth={1.5} />
          </View>
          <View>
            <Text style={[typography.hero, { color: colors.text }]}>Global Command Center</Text>
            <Text style={[typography.body, { color: colors.brand }]}>Real-Time Aggregated Enterprise Metrics</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.grid}>
          {kpis.map((kpi, idx) => {
            const IconComp = kpi.icon;
            return (
              <View key={idx} style={styles.gridItem}>
                <SGStatCard
                  title={kpi.title}
                  value={kpi.value.toString()}
                  icon={<IconComp color={kpi.color} size={24} />}
                  iconBgColor={isDark ? `${kpi.color}20` : `${kpi.color}15`}
                  style={{
                    borderTopWidth: 2,
                    borderTopColor: kpi.color,
                  }}
                />
              </View>
            );
          })}
        </View>

        <View style={{ marginTop: spacing.xl }}>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Live Pulse Stream</Text>
          <SGSection style={styles.terminal}>
             <Text style={[typography.mono, { color: colors.textSecondary }]}>
               {`> [SYSTEM] Global metrics synchronized at ${new Date(data?.lastUpdated || Date.now()).toLocaleTimeString()}...`}
             </Text>
             <Text style={[typography.mono, { color: colors.success, marginTop: spacing.sm }]}>
               {`> [FINANCE] Revenue engine optimal. MTD Input verified.`}
             </Text>
             <Text style={[typography.mono, { color: colors.brand, marginTop: spacing.sm }]}>
               {`> [HR] Payroll matrices standing by.`}
             </Text>
          </SGSection>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 32, 
    paddingTop: 40,
    borderBottomWidth: 1, 
  },
  content: { padding: 32 },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginHorizontal: -8,
  },
  gridItem: {
    width: Platform.OS === 'web' ? '33.333%' : '50%',
    padding: 8,
  },
  iconBox: { 
    width: 56, 
    height: 56, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  terminal: { 
    padding: 24, 
    gap: 8,
  }
});
