/**
 * Dashboard Layout — SGDS Example
 *
 * Responsive dashboard layout with KPI row, chart section,
 * and data table. Demonstrates proper section composition
 * and responsive breakpoints.
 *
 * Usage: Use as a reference for building new dashboard screens.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { useTheme, typography, spacing, radius, sgds } from '@/shared/theme/theme';
import { SGPageContainer } from '@/shared/ui/components/SGPageContainer';
import { SGPageHeader } from '@/shared/ui/components/SGPageHeader';
import { SGSectionHeader } from '@/shared/ui/components/SGSectionHeader';
import { SGGrid } from '@/shared/ui/components/SGGrid';
import { SGGradientStatCard } from '@/shared/ui/components/SGGradientStatCard';
import { SGBarChart } from '@/shared/ui/components/SGBarChart';
import { SGTable } from '@/shared/ui/components/SGTable';
import { SGSkeleton } from '@/shared/ui/components/SGSkeleton';
import { SGEmptyState } from '@/shared/ui/components/SGEmptyState';
import { SGPillSelector } from '@/shared/ui/components/SGPillSelector';

// ─── Types ──────────────────────────────────────────
interface DashboardData {
  revenue: number;
  deals: number;
  clients: number;
  growth: number;
  chartData: Array<{ label: string; value: number }>;
  tableData: Array<Record<string, any>>;
}

// ─── Component ──────────────────────────────────────
export const DashboardLayout: React.FC = () => {
  const colors = useTheme();
  const { width } = useWindowDimensions();

  // Responsive columns
  const kpiColumns = width >= 1024 ? 4 : width >= 768 ? 2 : 1;
  const chartColumns = width >= 1024 ? 2 : 1;

  // Mock data — replace with real API data
  const isLoading = false;
  const data: DashboardData = {
    revenue: 245800,
    deals: 42,
    clients: 128,
    growth: 18.5,
    chartData: [],
    tableData: [],
  };

  const [period, setPeriod] = React.useState('month');

  return (
    <SGPageContainer>
      {/* ─── Page Header ───────────────────────────── */}
      <SGPageHeader
        title="Sales Dashboard"
        subtitle="Overview of your sales performance"
      />

      {/* ─── Period Filter ─────────────────────────── */}
      <View style={styles.filterRow}>
        <SGPillSelector
          options={['Day', 'Week', 'Month', 'Quarter', 'Year']}
          value={period}
          onChange={setPeriod}
        />
      </View>

      {/* ─── KPI Row ───────────────────────────────── */}
      {isLoading ? (
        <SGGrid columns={kpiColumns} gap={spacing.md}>
          {[...Array(4)].map((_, i) => (
            <SGSkeleton key={i} height={140} borderRadius={radius.lg} />
          ))}
        </SGGrid>
      ) : (
        <SGGrid columns={kpiColumns} gap={spacing.md}>
          <SGGradientStatCard
            gradient={colors.gradientBrand}
            label="Revenue"
            value={`$${(data.revenue / 1000).toFixed(1)}K`}
            trend={{ value: 12.5, direction: 'up' }}
          />
          <SGGradientStatCard
            gradient={colors.gradientSuccess}
            label="Deals"
            value={String(data.deals)}
            trend={{ value: 8.3, direction: 'up' }}
          />
          <SGGradientStatCard
            gradient={colors.gradientPurple}
            label="Clients"
            value={String(data.clients)}
            trend={{ value: 5.1, direction: 'up' }}
          />
          <SGGradientStatCard
            gradient={colors.gradientGold}
            label="Growth"
            value={`+${data.growth}%`}
          />
        </SGGrid>
      )}

      {/* ─── Chart Section ─────────────────────────── */}
      <View style={[sgds.sectionBase({ colors }), styles.section]}>
        <SGSectionHeader
          title="Revenue Trend"
          action={{ label: 'View Report', onPress: () => {} }}
        />
        {isLoading ? (
          <SGSkeleton height={240} borderRadius={radius.md} />
        ) : data.chartData.length > 0 ? (
          <SGBarChart data={data.chartData} height={240} />
        ) : (
          <SGEmptyState
            icon="bar-chart-3"
            title="No chart data"
            description="Data will appear when there are transactions"
          />
        )}
      </View>

      {/* ─── Data Table ────────────────────────────── */}
      <View style={[sgds.sectionBase({ colors }), styles.section]}>
        <SGSectionHeader
          title="Recent Deals"
          action={{ label: 'View All', onPress: () => {} }}
        />
        {isLoading ? (
          <View style={{ gap: spacing.sm }}>
            {[...Array(5)].map((_, i) => (
              <SGSkeleton key={i} height={48} borderRadius={radius.sm} />
            ))}
          </View>
        ) : data.tableData.length > 0 ? (
          <SGTable
            columns={[
              { key: 'name', title: 'Deal Name' },
              { key: 'value', title: 'Value' },
              { key: 'status', title: 'Status' },
              { key: 'date', title: 'Close Date' },
            ]}
            data={data.tableData}
          />
        ) : (
          <SGEmptyState
            icon="inbox"
            title="No deals yet"
            description="Create your first deal to start tracking"
            actionLabel="Create Deal"
            onAction={() => {}}
          />
        )}
      </View>
    </SGPageContainer>
  );
};

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  filterRow: {
    marginBottom: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
});
