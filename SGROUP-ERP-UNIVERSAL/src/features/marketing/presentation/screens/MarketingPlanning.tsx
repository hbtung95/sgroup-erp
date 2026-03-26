/**
 * MarketingPlanning — Premium plan overview with glass sections & channel strategy
 * SGDS: glass containers, skeleton loading, gradient accents, animations
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { Target } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { marketingPlanningApi } from '../../api/marketingApi';
import { SGPageContainer, SGSkeleton, SGSectionHeader, SGEmptyState } from '../../../../shared/ui';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { typography, spacing, radius, sgds } from '../../../../shared/theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedItem = ({ index, children }: { index: number; children: React.ReactNode }) => {
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);
  useEffect(() => {
    const delay = index * 80;
    translateY.value = withDelay(delay, withSpring(0, { damping: 22, stiffness: 90 }));
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
  return <Animated.View style={style}>{children}</Animated.View>;
};

export function MarketingPlanning() {
  const { theme, isDark, colors } = useAppTheme();

  const mockPlanId = 'PLAN-2026-Q1';

  const { data: header, isLoading: headerLoading, error: headerErr } = useQuery({
    queryKey: ['mkt-plan-header', mockPlanId],
    queryFn: () => marketingPlanningApi.getHeader(mockPlanId),
    retry: 1,
  });

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['mkt-plan-kpis', mockPlanId],
    queryFn: () => marketingPlanningApi.getKpiTargets(mockPlanId),
    retry: 1,
  });

  const { data: assumptions, isLoading: asmLoading } = useQuery({
    queryKey: ['mkt-plan-asm', mockPlanId],
    queryFn: () => marketingPlanningApi.getAssumptions(mockPlanId),
    retry: 1,
  });

  const { data: channels, isLoading: channelsLoading } = useQuery({
    queryKey: ['mkt-plan-channels', mockPlanId],
    queryFn: () => marketingPlanningApi.getChannelBudgets(mockPlanId),
    retry: 1,
  });

  const isLoading = headerLoading || kpisLoading || asmLoading || channelsLoading;

  return (
    <SGPageContainer>
      {/* Header */}
      <AnimatedItem index={0}>
        <View style={styles.headerRow}>
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerIcon}
          >
            <Target size={26} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[typography.h1, { color: colors.text }]}>Kế Hoạch Marketing</Text>
            <Text style={[typography.small, { color: colors.textSecondary, marginTop: 3 }]}>
              {header?.planName || `Kế hoạch ${mockPlanId}`} • {header?.status || 'Active'}
            </Text>
          </View>
        </View>
      </AnimatedItem>

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          <SGSkeleton width="100%" height={140} borderRadius={radius.xl} />
          <View style={styles.skeletonRow}>
            <SGSkeleton width="48%" height={200} borderRadius={radius.xl} />
            <SGSkeleton width="48%" height={200} borderRadius={radius.xl} />
          </View>
          <SGSkeleton width="100%" height={180} borderRadius={radius.xl} />
        </View>
      ) : headerErr ? (
        <AnimatedItem index={1}>
          <View style={[styles.errorBox, {
            backgroundColor: isDark ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.04)',
            borderColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
          }]}>
            <Text style={styles.errorEmoji}>📡</Text>
            <Text style={[typography.h3, { color: colors.text }]}>Lỗi kết nối Backend</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
              Không thể lấy dữ liệu kế hoạch từ marketing-planning API.
            </Text>
          </View>
        </AnimatedItem>
      ) : (
        <View style={styles.contentGap}>
          {/* Overview */}
          <AnimatedItem index={1}>
            <View style={[styles.glassSection, {
              backgroundColor: colors.glass,
              borderColor: colors.glassBorder,
            }, Platform.OS === 'web' ? sgds.glass as any : {}]}>
              <SGSectionHeader title="Tổng quan" />
              <View style={styles.overviewGrid}>
                <View style={styles.overviewItem}>
                  <Text style={[typography.micro, { color: colors.textTertiary }]}>DỰ ÁN MỤC TIÊU</Text>
                  <Text style={[typography.bodyBold, { color: colors.text, marginTop: 4 }]}>{header?.projectId || 'N/A'}</Text>
                </View>
                <View style={styles.overviewItem}>
                  <Text style={[typography.micro, { color: colors.textTertiary }]}>TỔNG NGÂN SÁCH</Text>
                  <Text style={[typography.bodyBold, { color: colors.text, marginTop: 4 }]}>{header?.totalBudget?.toLocaleString('vi-VN')} ₫</Text>
                </View>
                <View style={[styles.overviewItem, { flex: 2, minWidth: 300 }]}>
                  <Text style={[typography.micro, { color: colors.textTertiary }]}>MỤC TIÊU CHÍNH</Text>
                  <Text style={[typography.bodyBold, { color: colors.text, marginTop: 4 }]}>{header?.objective || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </AnimatedItem>

          <View style={styles.columnsRow}>
            {/* KPIs */}
            <AnimatedItem index={2}>
              <View style={[styles.glassSection, styles.kpiColumn, {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              }, Platform.OS === 'web' ? sgds.glass as any : {}]}>
                <SGSectionHeader title="KPI Targets" />
                {Array.isArray(kpis) && kpis.map((k: any, i: number) => (
                  <View key={i} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                    <Text style={[typography.body, { color: colors.textSecondary, flex: 1 }]}>{k.metric}</Text>
                    <View style={[styles.kpiValueBadge, { backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.06)' }]}>
                      <Text style={[typography.bodyBold, { color: colors.warning }]}>{k.targetValue} {k.unit}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </AnimatedItem>

            {/* Assumptions */}
            <AnimatedItem index={3}>
              <View style={[styles.glassSection, styles.asmColumn, {
                backgroundColor: colors.glass,
                borderColor: colors.glassBorder,
              }, Platform.OS === 'web' ? sgds.glass as any : {}]}>
                <SGSectionHeader title="Giả định & Tỷ lệ chuyển đổi" />
                {Array.isArray(assumptions) && assumptions.map((a: any, i: number) => (
                  <View key={i} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.asmInfo}>
                      <Text style={[typography.bodyBold, { color: colors.text }]}>{a.description || a.factor}</Text>
                      <Text style={[typography.caption, { color: colors.textSecondary }]}>{a.factor}</Text>
                    </View>
                    <View style={[styles.asmValueBadge, { backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : 'rgba(245,158,11,0.06)' }]}>
                      <Text style={[typography.h3, { color: colors.warning }]}>{a.valuePercentage}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </AnimatedItem>
          </View>

          {/* Channel Strategy */}
          <AnimatedItem index={4}>
            <View style={[styles.glassSection, {
              backgroundColor: colors.glass,
              borderColor: colors.glassBorder,
            }, Platform.OS === 'web' ? sgds.glass as any : {}]}>
              <SGSectionHeader title="Chiến lược Kênh" />
              <View style={styles.channelGrid}>
                {Array.isArray(channels) && channels.map((ch: any, i: number) => (
                  <View key={i} style={[styles.channelCard, {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderColor: colors.border,
                  }]}>
                    <Text style={[typography.bodyBold, { color: colors.text, marginBottom: 12 }]}>{ch.channel}</Text>
                    <View style={styles.channelRows}>
                      <View style={styles.channelRow}>
                        <Text style={[typography.small, { color: colors.textSecondary }]}>Ngân sách</Text>
                        <Text style={[typography.smallBold, { color: colors.text }]}>{ch.allocatedBudget?.toLocaleString('vi-VN')} ₫</Text>
                      </View>
                      <View style={styles.channelRow}>
                        <Text style={[typography.small, { color: colors.textSecondary }]}>Phân bổ (%)</Text>
                        <Text style={[typography.smallBold, { color: colors.brand }]}>{ch.percentageShare}%</Text>
                      </View>
                      {ch.expectedLeads && (
                        <View style={styles.channelRow}>
                          <Text style={[typography.small, { color: colors.textSecondary }]}>Leads KPI</Text>
                          <Text style={[typography.smallBold, { color: colors.success }]}>{ch.expectedLeads}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </AnimatedItem>
        </View>
      )}
    </SGPageContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonWrap: {
    gap: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  errorBox: {
    padding: 40,
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  errorEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  contentGap: {
    gap: 24,
  },
  glassSection: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  overviewItem: {
    flex: 1,
    minWidth: 200,
  },
  columnsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  kpiColumn: {
    flex: 1,
    minWidth: 300,
  },
  asmColumn: {
    flex: 1.5,
    minWidth: 400,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  kpiValueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  asmInfo: {
    flex: 1,
  },
  asmValueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  channelGrid: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    gap: 16,
  },
  channelCard: {
    flex: 1,
    minWidth: 260,
    padding: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  channelRows: {
    gap: 8,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
