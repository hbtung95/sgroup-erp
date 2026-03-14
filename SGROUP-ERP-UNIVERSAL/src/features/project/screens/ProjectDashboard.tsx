import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Platform, Dimensions } from 'react-native';
import { typography, useTheme } from '../../../shared/theme/theme';
import { useProjects } from '../hooks/useProjects';
import { Building2, Home, CheckCircle2, TrendingUp, BarChart3, Percent, Layers, PieChart } from 'lucide-react-native';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGCard } from '../../../shared/ui/components';
import { formatTy } from '../../../shared/utils/formatters';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;
const isTablet = width > 768 && width <= 1024;

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

        {/* Dynamic Glowing Aurora */}
        {Platform.OS === 'web' && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 0, overflow: 'hidden' }]} pointerEvents="none">
            <View style={{
              position: 'absolute', top: '-10%', right: '10%', width: 600, height: 600,
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : 'rgba(56, 189, 248, 0.04)',
              borderRadius: 300, filter: 'blur(120px)',
            } as any} />
            <View style={{
              position: 'absolute', top: '20%', left: '-5%', width: 500, height: 500,
              backgroundColor: isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.04)',
              borderRadius: 250, filter: 'blur(100px)',
            } as any} />
          </View>
        )}
  
        <View style={[styles.header, { zIndex: 1 }]}>
          <Text style={[typography.h1, { color: colors.text, marginBottom: 8, fontWeight: '800', letterSpacing: -0.5 }]}>Tổng quan Dự án</Text>
          <Text style={[typography.body, { color: colors.textSecondary, fontSize: 16 }]}>
            Báo cáo nhanh các chỉ số về danh mục dự án & bảng hàng
          </Text>
        </View>
  
        {/* KPI Grid - Row 1 */}
        <View style={[styles.kpiGrid, { zIndex: 1 }]}>
          <SGCard style={[styles.kpiCard, styles.glassCard, isDark ? styles.glassCardDark : styles.glassCardLight]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={[typography.micro, { color: colors.textSecondary, marginBottom: 8, fontWeight: '700', letterSpacing: 0.5 }]}>TỔNG DỰ ÁN</Text>
                <Text style={[typography.h1, { color: colors.text, fontWeight: '800' }]}>{stats.total}</Text>
              </View>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#d1fae5' }]}>
                <Building2 size={24} color="#10b981" strokeWidth={2.5} />
              </View>
            </View>
            <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
              <Text style={[typography.micro, { color: colors.textTertiary }]}>
                <Text style={{ color: '#10b981', fontWeight: '800' }}>{stats.ongoing}</Text> đang bán •{' '}
                <Text style={{ color: '#f59e0b', fontWeight: '800' }}>{stats.paused}</Text> tạm dừng
              </Text>
            </View>
          </SGCard>
  
          <SGCard style={[styles.kpiCard, styles.glassCard, isDark ? styles.glassCardDark : styles.glassCardLight]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={[typography.micro, { color: colors.textSecondary, marginBottom: 8, fontWeight: '700', letterSpacing: 0.5 }]}>TỔNG SẢN PHẨM</Text>
                <Text style={[typography.h1, { color: colors.text, fontWeight: '800' }]}>{new Intl.NumberFormat('vi-VN').format(stats.totalUnits)}</Text>
              </View>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : '#dbeafe' }]}>
                <Layers size={24} color="#3b82f6" strokeWidth={2.5} />
              </View>
            </View>
            <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
              <Text style={[typography.micro, { color: colors.textTertiary, fontWeight: '500' }]}>Kho hàng toàn hệ thống</Text>
            </View>
          </SGCard>
  
          <SGCard style={[styles.kpiCard, styles.glassCard, isDark ? styles.glassCardDark : styles.glassCardLight]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={[typography.micro, { color: colors.textSecondary, marginBottom: 8, fontWeight: '700', letterSpacing: 0.5 }]}>ĐÃ BÁN</Text>
                <Text style={[typography.h1, { color: colors.text, fontWeight: '800' }]}>{new Intl.NumberFormat('vi-VN').format(stats.soldUnits)}</Text>
              </View>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : '#ede9fe' }]}>
                <CheckCircle2 size={24} color="#8b5cf6" strokeWidth={2.5} />
              </View>
            </View>
            <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[typography.micro, { color: colors.textTertiary, fontWeight: '500' }]}>Thanh khoản: </Text>
              <Text style={[typography.micro, { color: '#8b5cf6', fontWeight: '800' }]}>{stats.liquidity}%</Text>
            </View>
          </SGCard>
  
          <SGCard style={[styles.kpiCard, styles.glassCard, isDark ? styles.glassCardDark : styles.glassCardLight]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.micro, { color: colors.textSecondary, marginBottom: 8, fontWeight: '700', letterSpacing: 0.5 }]}>GIÁ TRỊ TẠM TÍNH</Text>
                <Text style={[typography.h1, { color: colors.text, fontWeight: '800', flexShrink: 1 }]} numberOfLines={1}>{formatTy(stats.value)}</Text>
              </View>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7', marginLeft: 8 }]}>
                <TrendingUp size={24} color="#f59e0b" strokeWidth={2.5} />
              </View>
            </View>
            <View style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
              <Text style={[typography.micro, { color: colors.textTertiary, fontWeight: '500' }]}>Dựa trên giá Trung bình & Tổng SP</Text>
            </View>
          </SGCard>
        </View>

      {/* Row 2: Charts & Table */}
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 24, marginTop: 32, zIndex: 1 }}>
        {/* Bar Chart: Status Distribution */}
        <SGCard style={[{ flex: 1, padding: 32 }, styles.glassCard, isDark ? styles.glassCardDark : styles.glassCardLight]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(236,72,153,0.15)' : '#fdf2f8', width: 44, height: 44 }]}>
              <PieChart size={22} color="#ec4899" strokeWidth={2.5} />
            </View>
            <Text style={[typography.h3, { color: colors.text, marginLeft: 16, fontWeight: '800' }]}>Trạng thái Mở bán</Text>
          </View>

          <View style={{ gap: 24 }}>
            {[
              { label: 'Đang mở bán', count: statusDist.ACTIVE, color: '#10b981', gradient: ['#34d399', '#059669'] },
              { label: 'Tạm dừng', count: statusDist.PAUSED, color: '#f59e0b', gradient: ['#fbbf24', '#d97706'] },
              { label: 'Đã đóng', count: statusDist.CLOSED, color: '#64748b', gradient: ['#94a3b8', '#475569'] },
            ].map((item, i) => (
              <View key={item.label}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={[typography.body, { color: colors.text, fontWeight: '600', fontSize: 16 }]}>{item.label}</Text>
                  <Text style={[typography.body, { color: item.color, fontWeight: '800', fontSize: 16 }]}>{item.count} <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '500' }}>dự án</Text></Text>
                </View>
                <View style={{ height: 16, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', borderRadius: 8, overflow: 'hidden' }}>
                  <View style={{
                    width: `${Math.round((item.count / maxStatusCount) * 100)}%`,
                    height: '100%',
                    backgroundColor: item.color, // In a real app, use LinearGradient here
                    borderRadius: 8,
                    minWidth: item.count > 0 ? 8 : 0,
                    ...(Platform.OS === 'web' && { transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' } as any),
                  } as any} />
                </View>
              </View>
            ))}
          </View>

          {/* Overall Liquidity Meter */}
          <View style={{ marginTop: 40, paddingTop: 32, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : '#ede9fe', width: 32, height: 32, borderRadius: 8 }]}>
                <Percent size={14} color="#8b5cf6" strokeWidth={2.5} />
              </View>
              <Text style={[typography.h4, { color: colors.text, fontWeight: '700', marginLeft: 12 }]}>Tốc độ Thanh khoản</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <View style={{ flex: 1, height: 24, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', borderRadius: 12, overflow: 'hidden' }}>
                <View style={{
                  width: `${Math.min(stats.liquidity, 100)}%`,
                  height: '100%',
                  borderRadius: 12,
                  backgroundColor: stats.liquidity >= 70 ? '#10b981' : stats.liquidity >= 40 ? '#f59e0b' : '#ef4444',
                  ...(Platform.OS === 'web' && { transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' } as any),
                } as any} />
              </View>
              <Text style={[typography.h2, { 
                color: stats.liquidity >= 70 ? '#10b981' : stats.liquidity >= 40 ? '#f59e0b' : '#ef4444',
                minWidth: 56, textAlign: 'right', fontWeight: '900'
              }]}>{stats.liquidity}%</Text>
            </View>
          </View>
        </SGCard>

        {/* Top Projects Table */}
        <SGCard style={[{ flex: 1.5, padding: 32 }, styles.glassCard, isDark ? styles.glassCardDark : styles.glassCardLight]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#d1fae5', width: 44, height: 44 }]}>
              <BarChart3 size={22} color="#10b981" strokeWidth={2.5} />
            </View>
            <Text style={[typography.h3, { color: colors.text, marginLeft: 16, fontWeight: '800' }]}>Top Dự án Toàn quốc</Text>
          </View>
          
          {topProjects.length === 0 ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Chưa có dữ liệu</Text>
            </View>
          ) : (
            <>
              {/* Table Header */}
              <View style={[styles.tableRow, { 
                borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', 
                borderBottomWidth: 1, paddingBottom: 16, marginBottom: 8 
              }]}>
                <Text style={[typography.micro, { color: colors.textSecondary, width: 40, fontWeight: '700' }]}>HẠNG</Text>
                <Text style={[typography.micro, { color: colors.textSecondary, flex: 1, fontWeight: '700' }]}>TÊN DỰ ÁN & MÃ</Text>
                <Text style={[typography.micro, { color: colors.textSecondary, width: 100, textAlign: 'center', fontWeight: '700' }]}>ĐÃ BÁN</Text>
                {isDesktop && <Text style={[typography.micro, { color: colors.textSecondary, width: 120, textAlign: 'center', fontWeight: '700' }]}>THANH KHOẢN</Text>}
                <Text style={[typography.micro, { color: colors.textSecondary, width: 120, textAlign: 'right', fontWeight: '700' }]}>ĐỊNH GIÁ</Text>
              </View>

              {topProjects.map((p: any, idx: number) => (
                <View key={p.id} style={[styles.tableRow, {
                  paddingVertical: 18,
                  borderBottomColor: idx < topProjects.length - 1 ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)') : 'transparent',
                  borderBottomWidth: idx < topProjects.length - 1 ? 1 : 0,
                }]}>
                  <View style={{ width: 40 }}>
                    <View style={{
                      width: 28, height: 28, borderRadius: 8,
                      backgroundColor: idx === 0 ? '#f59e0b' : idx === 1 ? '#94A3B8' : idx === 2 ? '#cd7f32' : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                      justifyContent: 'center', alignItems: 'center',
                    }}>
                      <Text style={{ color: idx < 3 ? '#fff' : colors.textSecondary, fontSize: 13, fontWeight: '800' }}>{idx + 1}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, paddingRight: 16 }}>
                    <Text style={[typography.body, { color: colors.text, fontWeight: '800', fontSize: 16 }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 4 }]} numberOfLines={1}>{p.projectCode} • {p.developer || 'N/A'}</Text>
                  </View>
                  <Text style={[typography.body, { color: '#10b981', width: 100, textAlign: 'center', fontWeight: '800', fontSize: 16 }]}>
                    {p.soldUnits}<Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: '600' }}>/{p.totalUnits}</Text>
                  </Text>
                  
                  {isDesktop && (
                    <View style={{ width: 120, alignItems: 'center' }}>
                      <View style={{
                        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                        backgroundColor: p.liquidity >= 70 ? (isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5') 
                          : p.liquidity >= 40 ? (isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb')
                          : (isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2'),
                        borderWidth: 1,
                        borderColor: p.liquidity >= 70 ? (isDark ? 'rgba(16,185,129,0.3)' : '#a7f3d0') 
                        : p.liquidity >= 40 ? (isDark ? 'rgba(245,158,11,0.3)' : '#fde68a')
                        : (isDark ? 'rgba(239,68,68,0.3)' : '#fecaca'),
                      }}>
                        <Text style={[typography.body, {
                          color: p.liquidity >= 70 ? '#10b981' : p.liquidity >= 40 ? '#f59e0b' : '#ef4444',
                          fontWeight: '800',
                        }]}>{p.liquidity}%</Text>
                      </View>
                    </View>
                  )}
                  
                  <Text style={[typography.body, { color: colors.text, width: 120, textAlign: 'right', fontWeight: '800', fontSize: 15 }]} numberOfLines={1}>
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
        <SGCard style={[{ padding: 32, marginTop: 32, zIndex: 1 }, styles.glassCard, isDark ? styles.glassCardDark : styles.glassCardLight]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : '#ede9fe', width: 44, height: 44 }]}>
              <TrendingUp size={22} color="#8b5cf6" strokeWidth={2.5} />
            </View>
            <Text style={[typography.h3, { color: colors.text, marginLeft: 16, fontWeight: '800' }]}>Phân tích Độ phủ Bảng hàng</Text>
          </View>

          <View style={{ gap: 24, flexDirection: isDesktop ? 'row' : 'column', flexWrap: 'wrap' }}>
            {topProjects.map((p: any) => {
              const pct = p.liquidity;
              return (
                <View key={p.id} style={{ flex: isDesktop ? 1 : undefined, minWidth: isDesktop ? 300 : '100%' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={[typography.body, { color: colors.text, fontWeight: '700', flex: 1, fontSize: 16 }]} numberOfLines={1}>{p.name}</Text>
                    <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 12, fontWeight: '600' }]}>
                      {p.soldUnits || 0} / {p.totalUnits} •{' '}
                      <Text style={{ color: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444', fontWeight: '800' }}>{pct}%</Text>
                    </Text>
                  </View>
                  <View style={{ height: 12, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)', borderRadius: 6, overflow: 'hidden', flexDirection: 'row' }}>
                    {/* Sold portion */}
                    <View style={{
                      width: `${Math.min(pct, 100)}%`,
                      height: '100%',
                      backgroundColor: pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444',
                      borderRadius: 6,
                      minWidth: (p.soldUnits || 0) > 0 ? 8 : 0,
                      ...(Platform.OS === 'web' && { transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' } as any),
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
    padding: isDesktop ? 40 : 20,
    flex: 1,
  },
  header: {
    marginBottom: 40,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  kpiCard: {
    flex: 1,
    minWidth: isDesktop ? 240 : (isTablet ? '45%' : '100%'),
    padding: 24,
    borderRadius: 24,
  },
  glassCard: {
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    } as any),
  },
  glassCardDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' } as any),
  },
  glassCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)' } as any),
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
