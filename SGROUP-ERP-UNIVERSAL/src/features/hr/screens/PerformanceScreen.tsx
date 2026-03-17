/**
 * PerformanceScreen — HR Performance & Evaluation Management
 * Features: View employee KPIs, review cycles, and performance ratings
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TrendingUp, Target, Award, Star, Search, CheckCircle, Clock } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../shared/ui/components';
import type { HRRole } from '../HRSidebar';
import { usePerformance } from '../hooks/useHR';

const currentYear = new Date().getFullYear();

// Data comes from API now
function scoreToRating(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'A-';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  return 'C';
}

const RATING_COLORS: Record<string, string> = {
  'A': '#8b5cf6',
  'A-': '#3b82f6',
  'B+': '#10b981',
  'B': '#f59e0b',
  'C': '#ef4444',
  '-': '#64748b',
};

export function PerformanceScreen({ userRole }: { userRole?: HRRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const currentQuarter = `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${currentYear}`;
  const { data: rawPerformance, isLoading } = usePerformance({ period: currentQuarter });
  const safePerformance = Array.isArray(rawPerformance) ? rawPerformance : (rawPerformance as any)?.data ?? [];

  const perfData = safePerformance.map((p: any) => {
    const score = p.overallScore || 0;
    const statusMap: Record<string, string> = { DRAFT: 'NOT_STARTED', SUBMITTED: 'IN_PROGRESS', ACKNOWLEDGED: 'COMPLETED' };
    return {
      id: p.id,
      code: p.employee?.employeeCode || '',
      name: p.employee?.fullName || '',
      dept: '',
      role: '',
      target: 100,
      actual: Math.round(score),
      rating: score > 0 ? scoreToRating(score) : '-',
      status: statusMap[p.status] || p.status,
    };
  });

  const completedCount = perfData.filter((r: any) => r.status === 'COMPLETED').length;
  const inProgressCount = perfData.filter((r: any) => r.status === 'IN_PROGRESS').length;
  const highPerformers = perfData.filter((r: any) => ['A', 'A-'].includes(r.rating)).length;
  const completePct = perfData.length > 0 ? Math.round(completedCount / perfData.length * 100) : 0;

  const COLUMNS: any = [
    { key: 'name', title: 'NHÂN VIÊN', flex: 1.5, render: (v: any, row: any) => (
      <View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{v}</Text>
        <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>{row.code} • {row.dept}</Text>
      </View>
    ) },
    { key: 'role', title: 'CHỨC DANH', flex: 1, render: (v: any) => <Text style={{ fontSize: 12, color: cText }}>{v}</Text> },
    { key: 'actual', title: 'HOÀN THÀNH (%)', flex: 1, align: 'center', render: (v: any, row: any) => (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 13, fontWeight: '800', color: v >= 100 ? '#10b981' : v >= 80 ? '#f59e0b' : '#ef4444' }}>{v}%</Text>
        <View style={{ width: '100%', height: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderRadius: 2, marginTop: 4 }}>
          <View style={{ width: `${Math.min(v, 100)}%`, height: '100%', backgroundColor: v >= 100 ? '#10b981' : v >= 80 ? '#f59e0b' : '#ef4444', borderRadius: 2 }} />
        </View>
      </View>
    ) },
    { key: 'rating', title: 'XẾP LOẠI', flex: 0.8, align: 'center', render: (v: any) => (
      <Text style={{ fontSize: 14, fontWeight: '900', color: RATING_COLORS[v] || cText }}>{v}</Text>
    ) },
    { key: 'status', title: 'TRẠNG THÁI Đ.GIÁ', flex: 1, align: 'center', render: (v: any) => {
      let bg = '#f1f5f9', text = '#64748b', label = 'CHƯA BẮT ĐẦU';
      if (v === 'COMPLETED') { bg = '#dcfce7'; text = '#16a34a'; label = 'ĐÃ HOÀN TẤT'; }
      if (v === 'IN_PROGRESS') { bg = '#fef3c7'; text = '#d97706'; label = 'ĐANG ĐÁNH GIÁ'; }
      
      return (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: bg, alignSelf: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: text }}>{label}</Text>
        </View>
      );
    } },
    { key: 'actions', title: '', flex: 0.5, align: 'right', render: () => (
      <TouchableOpacity style={{ padding: 6 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#3b82f6' }}>Chi tiết</Text>
      </TouchableOpacity>
    ) }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 28, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: '#10b98120', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} color="#10b981" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Đánh giá Hiệu suất (KPIs)</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Kỳ đánh giá: Q1 - {currentYear}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={{
              backgroundColor: '#10b981', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>TẠO KỲ ĐÁNH GIÁ MỚI</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'TỔNG NHÂN VIÊN Đ.GIÁ', val: String(perfData.length), unit: 'người', icon: Target, color: '#3b82f6' },
            { label: 'TỈ LỆ HOÀN TẤT', val: String(completePct), unit: '%', icon: CheckCircle, color: '#10b981' },
            { label: 'XẾP LOẠI A & A-', val: String(highPerformers), unit: 'người', icon: Star, color: '#8b5cf6' },
            { label: 'ĐANG ĐÁNH GIÁ', val: String(inProgressCount), unit: '', icon: Clock, color: '#f59e0b' },
          ].map((s, i) => (
            <View key={i} style={{
              flex: 1, minWidth: 200, padding: 22, borderRadius: 20,
              backgroundColor: cardBg, borderWidth: 1, borderColor,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={20} color={s.color} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: '800', color: cSub, flex: 1 }}>{s.label}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>{s.val}</Text>
                {s.unit ? <Text style={{ fontSize: 14, fontWeight: '700', color: cSub }}>{s.unit}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {/* Filters */}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 }}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: cardBg, borderWidth: 1, borderColor,
            borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
          }}>
            <Search size={18} color={cSub} />
            <Text style={{ color: cSub, fontSize: 14 }}>Tìm nhân viên, phòng ban...</Text>
          </View>
          <TouchableOpacity style={{
            paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
            backgroundColor: cardBg, borderWidth: 1, borderColor,
          }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>Kỳ đánh giá: Q1 - 2026</Text>
          </TouchableOpacity>
        </View>

        {/* Table */}
        <SGCard variant="glass" noPadding>
          {isLoading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#10b981" />
              <Text style={{ color: cSub, marginTop: 12, fontSize: 13 }}>Đang tải dữ liệu...</Text>
            </View>
          ) : (
            <SGTable 
              columns={COLUMNS} 
              data={perfData} 
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          )}
        </SGCard>

      </ScrollView>
    </View>
  );
}
