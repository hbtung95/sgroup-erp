/**
 * BenefitsScreen — HR Benefits and Social Insurance
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Briefcase, Search, ShieldCheck, Heart, Plane, Plus, LayoutGrid, List } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../shared/ui/components';
import { useEmployees } from '../hooks/useHR';

// Benefits screen now uses employee data from the API



export function BenefitsScreen() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const { data: empData, isLoading } = useEmployees({ status: 'ACTIVE' });
  const rawList = empData?.data ?? empData;
  const employees = Array.isArray(rawList) ? rawList : [];

  const benefitsData = employees.map((e: any) => ({
    id: e.id,
    code: e.employeeCode,
    name: e.fullName,
    bhxh: e.identityNumber || '-',
    pkHealth: e.status === 'ACTIVE' ? 'Gói Tiêu chuẩn' : '-',
    status: e.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING',
  }));

  const COLUMNS: any = [
    { key: 'name', title: 'NHÂN VIÊN', flex: 1.5, render: (v: any, row: any) => (
      <View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{v}</Text>
        <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>{row.code}</Text>
      </View>
    ) },
    { key: 'bhxh', title: 'MÃ SỐ BẢO HIỂM', flex: 1.2, render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '600', color: cText }}>{v}</Text> },
    { key: 'pkHealth', title: 'BH SỨC KHỎE', flex: 1.5, render: (v: any) => <Text style={{ fontSize: 12, color: v === '-' ? cSub : '#ec4899' }}>{v}</Text> },
    { key: 'status', title: 'TRẠNG THÁI', flex: 1, align: 'center', render: (v: any) => {
      const isActive = v === 'ACTIVE';
      return (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: isActive ? '#dcfce7' : '#fef3c7', alignSelf: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: isActive ? '#16a34a' : '#d97706' }}>
            {isActive ? 'ĐANG THAM GIA' : 'CHỜ ĐĂNG KÝ'}
          </Text>
        </View>
      );
    } }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 28, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: '#10b98120', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} color="#10b981" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Phúc lợi & BHXH</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Quản lý bảo hiểm và gói phúc lợi</Text>
            </View>
          </View>
          <TouchableOpacity style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: '#10b981', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
            ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
          }}>
            <Plus size={16} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>ĐĂNG KÝ BẢO HIỂM MỚI</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'BHXH / BHYT', desc: 'Bảo hiểm bắt buộc theo luật', icon: ShieldCheck, color: '#3b82f6', info: '240 thành viên', gradient: ['#3b82f6', '#2563eb'] },
            { label: 'BH SỨC KHỎE', desc: 'Khám chữa bệnh 24/7 nội trú', icon: Heart, color: '#ec4899', info: '150 thành viên', gradient: ['#ec4899', '#db2777'] },
            { label: 'TEAM BUILDING', desc: 'Sự kiện du lịch công ty hằng năm', icon: Plane, color: '#f59e0b', info: 'Dự kiến: T07/2026', gradient: ['#f59e0b', '#d97706'] },
          ].map((s, i) => (
            <LinearGradient
              key={i}
              colors={isDark ? ['rgba(30,41,59,0.5)', 'rgba(15,23,42,0.8)'] : ['#ffffff', '#f8fafc']}
              style={{
                flex: 1, minWidth: 260, padding: 24, borderRadius: 24,
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                shadowColor: isDark ? '#000' : s.color, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 4,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                <LinearGradient
                  colors={s.gradient as [string, string]} start={{x:0, y:0}} end={{x:1, y:1}}
                  style={{ width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: s.color, shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: {width:0, height:4} }}
                >
                  <s.icon size={24} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1, marginTop: 2 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>{s.label}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginTop: 4, lineHeight: 18 }}>{s.desc}</Text>
                </View>
              </View>
              <View style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : `${s.color}15`, alignSelf: 'flex-start' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: s.color, letterSpacing: 0.5 }}>{s.info.toUpperCase()}</Text>
              </View>
            </LinearGradient>
          ))}
        </Animated.View>

        {/* Table actions */}
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
            <Text style={{ color: cSub, fontSize: 14 }}>Tìm nhân viên...</Text>
          </View>
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
              data={benefitsData} 
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          </Animated.View>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
            {benefitsData.length === 0 ? (
              <Text style={{ color: cSub, fontSize: 15, padding: 32, textAlign: 'center', width: '100%' }}>Không có dữ liệu quyền lợi nhân viên.</Text>
            ) : null}
            {benefitsData.map((item: any, idx: number) => {
              const isActive = item.status === 'ACTIVE';

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
                        colors={isActive ? ['rgba(16,185,129,0.2)', 'rgba(16,185,129,0.05)'] : ['rgba(245,158,11,0.2)', 'rgba(245,158,11,0.05)']}
                        style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: isActive ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}
                      >
                        <ShieldCheck size={20} color={isActive ? "#10b981" : "#f59e0b"} />
                      </LinearGradient>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: '800', color: cText }} numberOfLines={1}>{item.name}</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginTop: 2 }}>{item.code}</Text>
                      </View>
                    </View>
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: isActive ? '#dcfce7' : '#fef3c7' }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: isActive ? '#16a34a' : '#d97706', letterSpacing: 0.5 }}>
                        {isActive ? 'ĐANG THAM GIA' : 'CHỜ ĐĂNG KÝ'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={{ paddingHorizontal: 4, marginBottom: 20, gap: 14 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: borderColor }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>Mã số bảo hiểm</Text>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: cText, fontVariant: ['tabular-nums'] }}>{item.bhxh}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>BH Sức khỏe</Text>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: item.pkHealth === '-' ? cSub : '#ec4899' }}>{item.pkHealth}</Text>
                    </View>
                  </View>

                  <View style={{ borderTopWidth: 1, borderTopColor: borderColor, paddingTop: 18, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff', borderRadius: 12 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#3b82f6' }}>QUẢN LÝ GÓI</Text>
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
