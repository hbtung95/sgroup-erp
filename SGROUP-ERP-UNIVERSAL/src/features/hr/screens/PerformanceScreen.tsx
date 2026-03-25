/**
 * PerformanceScreen — HR Performance & Evaluation Management
 * Features: View employee KPIs, review cycles, and performance ratings
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TrendingUp, Target, Award, Star, Search, CheckCircle, Clock, LayoutGrid, List, Medal, Crown } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
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
        <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
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
        </Animated.View>

        {/* Stats Summary */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'TỔNG NHẬN ĐÁNH GIÁ', val: String(perfData.length), unit: 'người', icon: Target, color: '#3b82f6', gradient: ['#3b82f6', '#2563eb'], shadow: '#3b82f6' },
            { label: 'TỈ LỆ HOÀN TẤT', val: String(completePct), unit: '%', icon: CheckCircle, color: '#10b981', gradient: ['#10b981', '#059669'], shadow: '#10b981' },
            { label: 'XẾP LOẠI A & A-', val: String(highPerformers), unit: 'người', icon: Star, color: '#8b5cf6', gradient: ['#8b5cf6', '#6366f1'], shadow: '#8b5cf6' },
            { label: 'ĐANG ĐÁNH GIÁ', val: String(inProgressCount), unit: '', icon: Clock, color: '#f59e0b', gradient: ['#f59e0b', '#d97706'], shadow: '#f59e0b' },
          ].map((s, i) => (
            <LinearGradient
              key={i}
              colors={isDark ? ['rgba(30,41,59,0.7)', 'rgba(15,23,42,0.8)'] : ['#ffffff', '#f8fafc']}
              style={{
                flex: 1, minWidth: 200, padding: 24, borderRadius: 24,
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                shadowColor: isDark ? '#000' : s.shadow, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 5,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <LinearGradient
                  colors={s.gradient as [string, string]} start={{x:0, y:0}} end={{x:1, y:1}}
                  style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', shadowColor: s.shadow, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: {width:0, height:4} }}
                >
                  <s.icon size={22} color="#fff" />
                </LinearGradient>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, flex: 1, letterSpacing: 0.5 }}>{s.label}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Text style={{ fontSize: 36, fontWeight: '900', color: cText, letterSpacing: -1 }}>{s.val}</Text>
                {s.unit ? <Text style={{ fontSize: 16, fontWeight: '700', color: cSub }}>{s.unit}</Text> : null}
              </View>
            </LinearGradient>
          ))}
        </Animated.View>

        {/* ═══ Gamification Leaderboard ═══ */}
        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap', marginTop: 8 }}>
          <LinearGradient
            colors={isDark ? ['rgba(245,158,11,0.15)', 'rgba(30,41,59,0.5)'] : ['#fffbeb', '#ffffff']}
            style={{
              flex: 1, minWidth: 320, padding: 24, borderRadius: 28,
              borderWidth: 1, borderColor: isDark ? 'rgba(245,158,11,0.2)' : '#fde68a',
              shadowColor: '#f59e0b', shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 5,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                 <View style={{ padding: 8, borderRadius: 12, backgroundColor: '#fef3c7' }}>
                   <Crown size={20} color="#f59e0b" />
                 </View>
                 <View>
                   <Text style={{ fontSize: 18, fontWeight: '900', color: cText }}>Bảng Vàng Thành Tích</Text>
                   <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginTop: 2 }}>Top 3 cá nhân xuất sắc nhất Quý</Text>
                 </View>
              </View>
            </View>
            <View style={{ gap: 12 }}>
              {[
                { name: 'Nguyễn Văn A', role: 'Trưởng nhóm KD', score: 98, rank: 1, color: '#f59e0b', badge: 'Vua Doanh Số' },
                { name: 'Trần Thị B', role: 'Chuyên viên Marketing', score: 95, rank: 2, color: '#94a3b8', badge: 'Sáng tạo' },
                { name: 'Lê Văn C', role: 'Dev Lead', score: 92, rank: 3, color: '#b45309', badge: 'Bug Hunter' },
              ].map((lb, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                   <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${lb.color}20`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                     {lb.rank === 1 ? <Crown size={16} color={lb.color} /> : <Medal size={16} color={lb.color} />}
                   </View>
                   <View style={{ flex: 1 }}>
                     <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>{lb.name}</Text>
                     <Text style={{ fontSize: 12, fontWeight: '600', color: cSub, marginTop: 2 }}>{lb.role}</Text>
                   </View>
                   <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(59,130,246,0.1)', marginRight: 12 }}>
                     <Text style={{ fontSize: 11, fontWeight: '800', color: '#3b82f6' }}>{lb.badge}</Text>
                   </View>
                   <Text style={{ fontSize: 16, fontWeight: '900', color: lb.color }}>{lb.score}%</Text>
                </View>
              ))}
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Filters */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 8 }}>
          <View style={{
            flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
            borderRadius: 16, padding: 4,
          }}>
            <TouchableOpacity onPress={() => setViewMode('table')} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: viewMode === 'table' ? (isDark ? '#3b82f6' : '#fff') : 'transparent', shadowColor: '#000', shadowOpacity: viewMode === 'table' ? 0.05 : 0, shadowRadius: 4, elevation: viewMode === 'table' ? 2 : 0 }}>
              <List size={18} color={viewMode === 'table' ? (isDark ? '#fff' : cText) : cSub} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setViewMode('grid')} style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: viewMode === 'grid' ? (isDark ? '#3b82f6' : '#fff') : 'transparent', shadowColor: '#000', shadowOpacity: viewMode === 'grid' ? 0.05 : 0, shadowRadius: 4, elevation: viewMode === 'grid' ? 2 : 0 }}>
              <LayoutGrid size={18} color={viewMode === 'grid' ? (isDark ? '#fff' : cText) : cSub} />
            </TouchableOpacity>
          </View>
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
        </Animated.View>

        {/* Content View */}
        {isLoading ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={{ color: cSub, marginTop: 16, fontSize: 14, fontWeight: '600' }}>Đang tải dữ liệu...</Text>
          </View>
        ) : viewMode === 'table' ? (
          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{
            backgroundColor: isDark ? 'rgba(30,41,59,0.35)' : '#ffffff',
            borderRadius: 28, overflow: 'hidden',
            borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            ...(Platform.OS === 'web' ? { 
              backdropFilter: 'blur(32px)', 
              WebkitBackdropFilter: 'blur(32px)',
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 12px 32px rgba(0,0,0,0.04)' 
            } : {}),
          }}>
            <SGTable 
              columns={COLUMNS} 
              data={perfData} 
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          </Animated.View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
            {perfData.length === 0 ? (
              <Text style={{ color: cSub, fontSize: 15, padding: 32, textAlign: 'center', width: '100%' }}>Không có dữ liệu đánh giá nào trong kỳ này.</Text>
            ) : null}
            {perfData.map((item: any, idx: number) => {
              let bg = '#f1f5f9', text = '#64748b', label = 'CHƯA BẮT ĐẦU';
              if (item.status === 'COMPLETED') { bg = '#dcfce7'; text = '#16a34a'; label = 'ĐÃ HOÀN TẤT'; }
              if (item.status === 'IN_PROGRESS') { bg = '#fef3c7'; text = '#d97706'; label = 'ĐANG ĐÁNH GIÁ'; }
              
              const isHigh = ['A', 'A-'].includes(item.rating);

              return (
                <Animated.View
                  entering={FadeInDown.delay(300 + idx * 40).duration(400).springify()}
                  key={item.id || idx}
                  style={{
                    flex: 1, minWidth: 320, maxWidth: Platform.OS === 'web' ? '48%' : '100%', borderRadius: 24,
                    shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.04, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4,
                  }}
                >
                  <LinearGradient
                    colors={isDark ? ['rgba(30,41,59,0.5)', 'rgba(15,23,42,0.8)'] : ['#ffffff', '#ffffff']}
                    style={{ flex: 1, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
                  >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center', flex: 1 }}>
                      <LinearGradient
                        colors={isDark ? ['rgba(16,185,129,0.2)', 'rgba(16,185,129,0.05)'] : ['#d1fae5', '#a7f3d0']}
                        style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(16,185,129,0.1)' }}
                      >
                        <Target size={20} color="#10b981" />
                      </LinearGradient>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: cText }} numberOfLines={1}>{item.name}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginTop: 2 }}>{item.code} • {item.dept || 'Nhân sự'}</Text>
                      </View>
                    </View>
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: bg }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: text, letterSpacing: 0.5 }}>
                        {label}
                      </Text>
                    </View>
                  </View>
                  
                  {isHigh && (
                    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4, marginBottom: 16 }}>
                       <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(245,158,11,0.15)', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                         <Award size={12} color="#d97706" />
                         <Text style={{ fontSize: 11, fontWeight: '800', color: '#d97706' }}>Xuất Sắc</Text>
                       </View>
                       {item.actual >= 95 && (
                         <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.15)', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                           <Star size={12} color="#8b5cf6" />
                           <Text style={{ fontSize: 11, fontWeight: '800', color: '#8b5cf6' }}>Ngôi Sao</Text>
                         </View>
                       )}
                    </View>
                  )}
                  
                  <View style={{ paddingHorizontal: 4, marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>Tiến độ KPIs</Text>
                      <Text style={{ fontSize: 20, fontWeight: '900', color: item.actual >= 100 ? '#10b981' : item.actual >= 80 ? '#f59e0b' : '#ef4444' }}>{item.actual}%</Text>
                    </View>
                    <View style={{ width: '100%', height: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <LinearGradient 
                         colors={item.actual >= 100 ? ['#10b981', '#34d399'] : item.actual >= 80 ? ['#f59e0b', '#fbbf24'] : ['#ef4444', '#f87171']}
                         start={{x:0, y:0}} end={{x:1, y:0}}
                         style={{ width: `${Math.min(item.actual, 100)}%`, height: '100%', borderRadius: 3 }} 
                      />
                    </View>
                  </View>

                  <View style={{ borderTopWidth: 1, borderTopColor: borderColor, paddingTop: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                       <Text style={{ fontSize: 12, fontWeight: '700', color: cSub, textTransform: 'uppercase' }}>Xếp loại</Text>
                       <Text style={{ fontSize: 24, fontWeight: '900', color: RATING_COLORS[item.rating] || cText }}>{item.rating}</Text>
                    </View>
                    <TouchableOpacity style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', borderRadius: 12 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#3b82f6' }}>CHI TIẾT KẾT QUẢ</Text>
                    </TouchableOpacity>
                  </View>
                  </LinearGradient>
                </Animated.View>
              );
            })}
          </View>
        )}

      </ScrollView>
    </View>
  );
}
