/**
 * UserGrowthChart — Line chart showing user registration trends
 * Daily bars + monthly summary
 */
import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { TrendingUp, Users, UserPlus } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { typography, spacing } from '../../../shared/theme/theme';
import { SGSection } from '../../../shared/ui/components/SGSection';
import { SGSkeleton } from '../../../shared/ui/components/SGSkeleton';
import { SGChip } from '../../../shared/ui/components/SGChip';
import { useUserGrowth } from '../hooks/useAdmin';

type ViewMode = 'daily' | 'weekly' | 'monthly';

export function UserGrowthChart() {
  const { colors } = useAppTheme();
  const [mode, setMode] = useState<ViewMode>('monthly');
  const { data, isLoading } = useUserGrowth(90);

  if (isLoading) return <SGSkeleton width="100%" height={280} borderRadius={16} />;
  if (!data) return null;

  const chartData = mode === 'daily' ? (data.daily ?? []).slice(-30) : mode === 'weekly' ? (data.weekly ?? []) : (data.monthly ?? []);
  const maxCount = chartData.length > 0 ? Math.max(...chartData.map((d: any) => d.count), 1) : 1;

  return (
    <SGSection noPadding>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.iconBox, { backgroundColor: `${colors.accent}12` }]}>
              <TrendingUp size={16} color={colors.accent} />
            </View>
            <View>
              <Text style={[typography.bodyBold, { color: colors.text }]}>User Growth</Text>
              <Text style={[typography.micro, { color: colors.textTertiary }]}>Xu hướng tăng trưởng người dùng</Text>
            </View>
          </View>
          <View style={styles.modeChips}>
            <SGChip label="Ngày" selected={mode === 'daily'} onPress={() => setMode('daily')} />
            <SGChip label="Tuần" selected={mode === 'weekly'} onPress={() => setMode('weekly')} />
            <SGChip label="Tháng" selected={mode === 'monthly'} onPress={() => setMode('monthly')} />
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statItem, { backgroundColor: `${colors.accent}06` }]}>
            <Users size={14} color={colors.accent} />
            <Text style={[typography.h4, { color: colors.accent }]}>{data.totalUsers}</Text>
            <Text style={[typography.micro, { color: colors.textTertiary }]}>Tổng Users</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: `${colors.success}06` }]}>
            <UserPlus size={14} color={colors.success} />
            <Text style={[typography.h4, { color: colors.success }]}>{data.newUsersThisPeriod}</Text>
            <Text style={[typography.micro, { color: colors.textTertiary }]}>Mới (90 ngày)</Text>
          </View>
          <View style={[styles.statItem, { backgroundColor: `${colors.info}06` }]}>
            <Users size={14} color={colors.info} />
            <Text style={[typography.h4, { color: colors.info }]}>{data.activeUsers}</Text>
            <Text style={[typography.micro, { color: colors.textTertiary }]}>Đang hoạt động</Text>
          </View>
        </View>

        {/* Bar Chart */}
        <View style={[styles.chartArea, { borderTopColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chart}>
              {chartData.map((item: any, i: number) => {
                const height = maxCount > 0 ? (item.count / maxCount) * 120 : 0;
                const label = mode === 'daily' ? item.date.slice(5) : (mode === 'weekly' ? item.week : item.month);
                return (
                  <Animated.View key={i} entering={FadeInDown.delay(i * 30).duration(250)} style={styles.barCol}>
                    <Text style={[typography.micro, { color: colors.accent, fontWeight: '700', marginBottom: 2 }]}>
                      {item.count > 0 ? item.count : ''}
                    </Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(height, 2),
                          backgroundColor: item.count > 0 ? colors.accent : colors.border,
                          opacity: item.count > 0 ? 0.8 : 0.3,
                        },
                      ]}
                    />
                    <Text style={[typography.micro, { color: colors.textDisabled, marginTop: 4, fontSize: 9 }]}>
                      {label}
                    </Text>
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </SGSection>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, flexWrap: 'wrap', gap: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modeChips: { flexDirection: 'row', gap: 4 },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  statItem: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 10, gap: 2 },
  chartArea: { borderTopWidth: 1, padding: 16 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, minHeight: 140 },
  barCol: { alignItems: 'center', minWidth: 28 },
  bar: { width: 18, borderRadius: 4 },
});
