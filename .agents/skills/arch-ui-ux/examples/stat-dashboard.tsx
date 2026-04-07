/**
 * SGDS KPI Dashboard Layout — Example
 *
 * Demonstrates a stat dashboard using SGGradientStatCard, SGKpiCard,
 * and responsive grid layout following SGDS Pro Max guidelines.
 */
import React from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import { DollarSign, Users, TrendingUp, ShoppingCart } from 'lucide-react-native';
import { useAppTheme } from '@/shared/theme/useAppTheme';
import { spacing, sgds } from '@/shared/theme/theme';
import { SGPageContainer } from '@/shared/ui/components/SGPageContainer';
import { SGPageHeader } from '@/shared/ui/components/SGPageHeader';
import { SGGradientStatCard } from '@/shared/ui/components/SGGradientStatCard';
import { SGKpiCard } from '@/shared/ui/components/SGKpiCard';
import { SGGrid } from '@/shared/ui/components/SGGrid';
import { SGDonutChart } from '@/shared/ui/components/SGDonutChart';
import { SGBarChart } from '@/shared/ui/components/SGBarChart';
import { SGSection } from '@/shared/ui/components/SGSection';
import { SGSectionHeader } from '@/shared/ui/components/SGSectionHeader';

export const StatDashboard = () => {
  const { colors, theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const cols = width >= 1024 ? 4 : width >= 768 ? 2 : 1;

  return (
    <SGPageContainer>
      <ScrollView contentContainerStyle={{ padding: sgds.layout.contentPadding }}>
        <SGPageHeader title="Dashboard" subtitle="Sales Overview" />

        {/* KPI Cards Row */}
        <SGGrid columns={cols} gap={spacing.base}>
          <SGGradientStatCard
            gradient={colors.gradientBrand}
            icon={<DollarSign size={22} color="#fff" />}
            label="Revenue"
            value="$124,500"
            change="+12.5%"
          />
          <SGGradientStatCard
            gradient={colors.gradientSuccess}
            icon={<Users size={22} color="#fff" />}
            label="Customers"
            value="1,284"
            change="+8.3%"
          />
          <SGGradientStatCard
            gradient={colors.gradientPurple}
            icon={<ShoppingCart size={22} color="#fff" />}
            label="Orders"
            value="842"
            change="+15.2%"
          />
          <SGGradientStatCard
            gradient={colors.gradientGold}
            icon={<TrendingUp size={22} color="#fff" />}
            label="Conversion"
            value="3.24%"
            change="+0.8%"
          />
        </SGGrid>

        {/* Charts Section */}
        <View style={{ marginTop: sgds.layout.sectionGap }}>
          <SGGrid columns={width >= 1024 ? 2 : 1} gap={spacing.base}>
            <SGSection>
              <SGSectionHeader title="Revenue Breakdown" />
              <SGDonutChart
                data={[
                  { label: 'Product A', value: 45, color: colors.brand },
                  { label: 'Product B', value: 30, color: colors.purple },
                  { label: 'Product C', value: 25, color: colors.accentCyan },
                ]}
              />
            </SGSection>

            <SGSection>
              <SGSectionHeader title="Monthly Trend" />
              <SGBarChart
                data={[42, 58, 35, 72, 65, 88]}
                labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']}
                color={colors.brand}
              />
            </SGSection>
          </SGGrid>
        </View>
      </ScrollView>
    </SGPageContainer>
  );
};
