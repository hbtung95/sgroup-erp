import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { typography, useTheme } from '../../../shared/theme/theme';
import { useProjects } from '../hooks/useProjects';
import { Building2, Home, CheckCircle2, TrendingUp, BarChart3, Percent } from 'lucide-react-native';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGCard } from '../../../shared/ui/components';
import { formatTy } from '../../../shared/utils/formatters';

export function ProjectDashboard() {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { data: projects, isLoading, isError } = useProjects();

  const stats = useMemo(() => {
    if (!projects || !Array.isArray(projects)) {
      return { total: 0, ongoing: 0, paused: 0, closed: 0, totalUnits: 0, soldUnits: 0, value: 0, liquidity: 0 };
    }
    
    let ongoing = 0, paused = 0, closed = 0;
    let totalUnits = 0;
    let soldUnits = 0;
    let value = 0;
    
    projects.forEach((p: any) => {
      if (p.status === 'ACTIVE') ongoing++;
      else if (p.status === 'PAUSED') paused++;
      else closed++;
      totalUnits += (p.totalUnits || 0);
      soldUnits += (p.soldUnits || 0);
      value += (p.avgPrice || 0) * (p.totalUnits || 0);
    });

    const liquidity = totalUnits > 0 ? Math.round((soldUnits / totalUnits) * 100) : 0;
    return { total: projects.length, ongoing, paused, closed, totalUnits, soldUnits, value, liquidity };
  }, [projects]);

  // Top projects by liquidity
  const topProjects = useMemo(() => {
    if (!projects || !Array.isArray(projects)) return [];
    return [...projects]
      .filter((p: any) => p.totalUnits > 0)
      .map((p: any) => ({
        ...p,
        liquidity: Math.round(((p.soldUnits || 0) / p.totalUnits) * 100),
        pipelineValue: (p.avgPrice || 0) * (p.totalUnits || 0),
      }))
      .sort((a: any, b: any) => b.liquidity - a.liquidity)
      .slice(0, 5);
  }, [projects]);

  // Status distribution for bar chart
  const statusDist = useMemo(() => {
    const dist = { ACTIVE: 0, PAUSED: 0, CLOSED: 0 };
    if (!projects || !Array.isArray(projects)) return dist;
    projects.forEach((p: any) => {
      if (p.status === 'ACTIVE') dist.ACTIVE++;
      else if (p.status === 'PAUSED') dist.PAUSED++;
      else dist.CLOSED++;
    });
    return dist;
  }, [projects]);

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const maxStatusCount = Math.max(statusDist.ACTIVE, statusDist.PAUSED, statusDist.CLOSED, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Aurora backdrop */}
      {Platform.OS === 'web' && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[styles.aurora, {
            top: '-10%', left: '-5%', width: 800, height: 800,
            backgroundColor: isDark ? 'rgba(16,185,129,0.05)' : 'rgba(16,185,129,0.03)',
            filter: 'blur(100px)',
          } as any]} />
        </View>
      )}

      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.text, marginBottom: 8 }]}>Tổng quan Dự án</Text>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Báo cáo nhanh các chỉ số về danh mục dự án & bảng hàng
        </Text>
      </View>

      {/* KPI Grid - Row 1 */}
      <View style={styles.kpiGrid}>
        <SGCard style={{ ...styles.kpiCard, borderColor: isDark ? 'rgba(16,185,129,0.2)' : '#d1fae5', borderWidth: 1 } as any}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5' }]}>
            <Building2 size={24} color="#10b981" />
          </View>
          <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 16, marginBottom: 4 }]}>TỔNG DỰ ÁN</Text>
          <Text style={[typography.h2, { color: colors.text }]}>{stats.total}</Text>
          <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 8 }]}>
            <Text style={{ color: '#10b981', fontWeight: 'bold' }}>{stats.ongoing}</Text> đang bán •{' '}
            <Text style={{ color: '#f59e0b', fontWeight: 'bold' }}>{stats.paused}</Text> tạm dừng
          </Text>
        </SGCard>

        <SGCard style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff' }]}>
            <Home size={24} color="#3b82f6" />
          </View>
          <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 16, marginBottom: 4 }]}>TỔNG SẢN PHẨM</Text>
          <Text style={[typography.h2, { color: colors.text }]}>{stats.totalUnits}</Text>
          <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 8 }]}>Kho hàng phân phối</Text>
        </SGCard>

        <SGCard style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : '#f5f3ff' }]}>
            <CheckCircle2 size={24} color="#8b5cf6" />
          </View>
          <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 16, marginBottom: 4 }]}>SẢN PHẨM ĐÃ BÁN</Text>
          <Text style={[typography.h2, { color: colors.text }]}>{stats.soldUnits}</Text>
          <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 8 }]}>
            Thanh khoản <Text style={{ color: '#8b5cf6', fontWeight: 'bold' }}>{stats.liquidity}%</Text>
          </Text>
        </SGCard>

        <SGCard style={styles.kpiCard}>
          <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb' }]}>
            <TrendingUp size={24} color="#f59e0b" />
          </View>
          <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 16, marginBottom: 4 }]}>TỔNG GIÁ TRỊ TẠM TÍNH</Text>
          <Text style={[typography.h2, { color: colors.text }]} numberOfLines={1}>{formatTy(stats.value)}</Text>
          <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 8 }]}>Dựa trên giá TB & tổng SP</Text>
        </SGCard>
      </View>

      {/* Row 2: Charts & Table */}
      <View style={{ flexDirection: 'row', gap: 24, marginTop: 24 }}>
        {/* Bar Chart: Status Distribution */}
        <SGCard style={{ flex: 1, padding: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', width: 36, height: 36 }]}>
              <BarChart3 size={18} color="#3b82f6" />
            </View>
            <Text style={[typography.h4, { color: colors.text, marginLeft: 12 }]}>Phân bổ trạng thái Dự án</Text>
          </View>

          <View style={{ gap: 20 }}>
            {[
              { label: 'Đang mở bán', count: statusDist.ACTIVE, color: '#10b981' },
              { label: 'Tạm dừng', count: statusDist.PAUSED, color: '#f59e0b' },
              { label: 'Đã đóng', count: statusDist.CLOSED, color: '#64748b' },
            ].map(item => (
              <View key={item.label}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>{item.label}</Text>
                  <Text style={[typography.body, { color: item.color, fontWeight: '700' }]}>{item.count}</Text>
                </View>
                <View style={{ height: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
                  <View style={{
                    width: `${Math.round((item.count / maxStatusCount) * 100)}%`,
                    height: '100%',
                    backgroundColor: item.color,
                    borderRadius: 6,
                    minWidth: item.count > 0 ? 8 : 0,
                  } as any} />
                </View>
              </View>
            ))}
          </View>

          {/* Overall Liquidity Meter */}
          <View style={{ marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Percent size={16} color="#8b5cf6" />
              <Text style={[typography.body, { color: colors.text, fontWeight: '700', marginLeft: 8 }]}>Thanh khoản tổng</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={{ flex: 1, height: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 8, overflow: 'hidden' }}>
                <View style={{
                  width: `${Math.min(stats.liquidity, 100)}%`,
                  height: '100%',
                  borderRadius: 8,
                  backgroundColor: stats.liquidity >= 70 ? '#10b981' : stats.liquidity >= 40 ? '#f59e0b' : '#ef4444',
                } as any} />
              </View>
              <Text style={[typography.h3, { 
                color: stats.liquidity >= 70 ? '#10b981' : stats.liquidity >= 40 ? '#f59e0b' : '#ef4444',
                minWidth: 48, textAlign: 'right'
              }]}>{stats.liquidity}%</Text>
            </View>
          </View>
        </SGCard>

        {/* Top Projects Table */}
        <SGCard style={{ flex: 1.2, padding: 24 }}>
          <Text style={[typography.h4, { color: colors.text, marginBottom: 24 }]}>Top Dự án theo Thanh khoản</Text>
          
          {topProjects.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Chưa có dữ liệu</Text>
            </View>
          ) : (
            <>
              {/* Table Header */}
              <View style={[styles.tableRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', borderBottomWidth: 1, paddingBottom: 12 }]}>
                <Text style={[typography.micro, { color: colors.textSecondary, width: 30 }]}>#</Text>
                <Text style={[typography.micro, { color: colors.textSecondary, flex: 1 }]}>DỰ ÁN</Text>
                <Text style={[typography.micro, { color: colors.textSecondary, width: 80, textAlign: 'center' }]}>ĐÃ BÁN</Text>
                <Text style={[typography.micro, { color: colors.textSecondary, width: 80, textAlign: 'center' }]}>THANH KHOẢN</Text>
                <Text style={[typography.micro, { color: colors.textSecondary, width: 100, textAlign: 'right' }]}>GIÁ TRỊ</Text>
              </View>

              {topProjects.map((p: any, idx: number) => (
                <View key={p.id} style={[styles.tableRow, {
                  paddingVertical: 14,
                  borderBottomColor: idx < topProjects.length - 1 ? (isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9') : 'transparent',
                  borderBottomWidth: idx < topProjects.length - 1 ? 1 : 0,
                }]}>
                  <View style={{ width: 30 }}>
                    <View style={{
                      width: 24, height: 24, borderRadius: 6,
                      backgroundColor: idx === 0 ? '#f59e0b' : idx === 1 ? '#94A3B8' : idx === 2 ? '#cd7f32' : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Text style={{ color: idx < 3 ? '#fff' : colors.textSecondary, fontSize: 11, fontWeight: '800' }}>{idx + 1}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 2 }]}>{p.projectCode}</Text>
                  </View>
                  <Text style={[typography.body, { color: '#10b981', width: 80, textAlign: 'center', fontWeight: '700' }]}>
                    {p.soldUnits}/{p.totalUnits}
                  </Text>
                  <View style={{ width: 80, alignItems: 'center' }}>
                    <View style={{
                      paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
                      backgroundColor: p.liquidity >= 70 ? (isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5') 
                        : p.liquidity >= 40 ? (isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb')
                        : (isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2'),
                    }}>
                      <Text style={[typography.micro, {
                        color: p.liquidity >= 70 ? '#10b981' : p.liquidity >= 40 ? '#f59e0b' : '#ef4444',
                        fontWeight: '700',
                      }]}>{p.liquidity}%</Text>
                    </View>
                  </View>
                  <Text style={[typography.body, { color: colors.text, width: 100, textAlign: 'right', fontWeight: '600' }]} numberOfLines={1}>
                    {formatTy(p.pipelineValue)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </SGCard>
      </View>
      {/* Row 3: Per-project Liquidity Comparison */}
      {topProjects.length > 0 && (
        <SGCard style={{ padding: 24, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : '#f5f3ff', width: 36, height: 36 }]}>
              <TrendingUp size={18} color="#8b5cf6" />
            </View>
            <Text style={[typography.h4, { color: colors.text, marginLeft: 12 }]}>So sánh Thanh khoản theo Dự án</Text>
          </View>

          <View style={{ gap: 16 }}>
            {topProjects.map((p: any) => {
              const pct = p.liquidity;
              return (
                <View key={p.id}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={[typography.body, { color: colors.text, fontWeight: '700', flex: 1 }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 12 }]}>
                      {p.soldUnits || 0}/{p.totalUnits} •{' '}
                      <Text style={{ color: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444', fontWeight: '800' }}>{pct}%</Text>
                    </Text>
                  </View>
                  <View style={{ height: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 10, overflow: 'hidden', flexDirection: 'row' }}>
                    {/* Sold portion */}
                    <View style={{
                      width: `${Math.min(pct, 100)}%`,
                      height: '100%',
                      backgroundColor: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444',
                      borderRadius: 10,
                      minWidth: (p.soldUnits || 0) > 0 ? 4 : 0,
                    } as any} />
                  </View>
                </View>
              );
            })}
          </View>
        </SGCard>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },
  aurora: { position: 'absolute', pointerEvents: 'none', borderRadius: 999 },
  header: {
    marginBottom: 32,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  kpiCard: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 220 : '45%',
    padding: 24,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
