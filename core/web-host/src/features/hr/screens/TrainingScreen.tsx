/**
 * TrainingScreen — Premium HR Learning & Development (L&D)
 * LMS Dashboard: Training programs, compliance courses, employee progress
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { GraduationCap, Trophy, CheckCircle, Clock, Search, MoreHorizontal, BookOpen, Users, PlayCircle, Star, ArrowRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { sgds } from '@sgroup/ui/src/theme/theme';
import { SGTable } from '@sgroup/ui/src/ui/components';
import type { HRRole } from '../HRSidebar';
import { useCourses, useTrainees } from '../hooks/useHR';

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  COMPLETED: { bg: 'rgba(34,197,94,0.15)', text: '#16a34a', label: 'HOÀN THÀNH' },
  IN_PROGRESS: { bg: 'rgba(245,158,11,0.15)', text: '#d97706', label: 'ĐANG HỌC' },
  NOT_STARTED: { bg: 'rgba(220,38,38,0.15)', text: '#dc2626', label: 'CHƯA HỌC' },
};

export function TrainingScreen({ userRole }: { userRole?: HRRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const { data: rawCourses, isLoading: loadingCourses } = useCourses();
  const { data: rawTrainees, isLoading: loadingTrainees } = useTrainees();

  const safeCourses = Array.isArray(rawCourses) ? rawCourses : (rawCourses as any)?.data ?? [];
  const safeTrainees = Array.isArray(rawTrainees) ? rawTrainees : (rawTrainees as any)?.data ?? [];

  const allCourses = safeCourses.map((c: any) => ({
    id: c.id,
    title: c.title,
    category: c.category || '',
    duration: c.duration || '',
    enrolled: c.enrolled,
    completed: c.completed,
    status: c.status,
  }));

  const allTrainees = safeTrainees.map((t: any) => ({
    id: t.id,
    code: t.employeeCode || '',
    name: t.name,
    course: t.course?.title || '',
    progress: t.progress,
    score: t.score || '-',
    status: t.status,
  }));

  const COLUMNS: any = [
    { key: 'name', title: 'HỌC VIÊN', flex: 1.5, render: (v: any, row: any) => (
      <View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: cText }}>{v}</Text>
        <Text style={{ fontSize: 11, color: cSub, marginTop: 2 }}>{row.code}</Text>
      </View>
    ) },
    { key: 'course', title: 'KHÓA HỌC', flex: 1.5, render: (v: any) => <Text style={{ fontSize: 13, fontWeight: '600', color: cText }} numberOfLines={2}>{v}</Text> },
    { key: 'progress', title: 'TIẾN ĐỘ', flex: 1, align: 'center', render: (v: any) => (
      <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 6 }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: cSub }}>Tiến độ</Text>
          <Text style={{ fontSize: 11, fontWeight: '800', color: v === 100 ? '#10b981' : '#3b82f6' }}>{v}%</Text>
        </View>
        <View style={{ width: '100%', height: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderRadius: 3 }}>
          <View style={{ width: `${v}%`, height: '100%', backgroundColor: v === 100 ? '#10b981' : '#3b82f6', borderRadius: 3 }} />
        </View>
      </View>
    ) },
    { key: 'score', title: 'ĐIỂM SỐ', flex: 0.8, align: 'center', render: (v: any) => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
        {v !== '-' && <Star size={12} fill="#eab308" color="#eab308" />}
        <Text style={{ fontSize: 14, fontWeight: '800', color: v !== '-' ? '#eab308' : cSub }}>{v}</Text>
      </View>
    ) },
    { key: 'status', title: 'TRẠNG THÁI', flex: 1, align: 'center', render: (v: any) => {
      const s = STATUS_CONFIG[v] || STATUS_CONFIG['NOT_STARTED'];
      return (
        <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: s.bg, alignSelf: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: s.text }}>{s.label}</Text>
        </View>
      );
    } },
    { key: 'actions', title: '', flex: 0.5, align: 'right', render: () => (
      <TouchableOpacity style={{ padding: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 8 }}>
        <MoreHorizontal size={16} color={cText} />
      </TouchableOpacity>
    ) }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Premium LMS Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <LinearGradient 
              colors={['#06b6d4', '#3b82f6']} start={{x:0,y:0}} end={{x:1,y:1}}
              style={{ width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', 
                     shadowColor: '#06b6d4', shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}
            >
              <GraduationCap size={28} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -1 }}>Đào tạo (L&D)</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>Trung tâm Phát triển Năng lực & Khóa học</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={{
              backgroundColor: '#06b6d4', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16,
              shadowColor: '#06b6d4', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>TẠO KHÓA HỌC</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Learning KPI Cards */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'KHÓA ĐANG MỞ', val: '12', unit: 'khóa', icon: BookOpen, color: '#3b82f6', shadow: '#3b82f6' },
            { label: 'GIỜ ĐÀO TẠO YTD', val: '1,420', unit: 'giờ', icon: Clock, color: '#f59e0b', shadow: '#f59e0b' },
            { label: 'TỈ LỆ CẤP CHỨNG CHỈ', val: '85', unit: '%', icon: Trophy, color: '#10b981', shadow: '#10b981' },
            { label: 'CHƯA HOÀN THÀNH', val: '38', unit: 'user', icon: Users, color: '#ef4444', shadow: '#ef4444' },
          ].map((s, i) => (
            <LinearGradient
              key={i}
              colors={isDark ? ['rgba(30,41,59,0.7)', 'rgba(15,23,42,0.8)'] : ['#ffffff', '#ffffff']}
              style={{
                flex: 1, minWidth: 200, padding: 24, borderRadius: 24,
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)',
                shadowColor: isDark ? '#000' : s.shadow, shadowOpacity: isDark ? 0.5 : 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={22} color={s.color} />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '800', color: cSub, flex: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <Text style={{ fontSize: 36, fontWeight: '900', color: cText, letterSpacing: -1 }}>{s.val}</Text>
                {s.unit ? <Text style={{ fontSize: 15, fontWeight: '700', color: cSub }}>{s.unit}</Text> : null}
              </View>
            </LinearGradient>
          ))}
        </Animated.View>

        {/* Featured Courses Carousel */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>Khóa học Nổi bật</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#06b6d4' }}>Xem tất cả</Text>
              <ArrowRight size={16} color="#06b6d4" />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20 }}>
            {loadingCourses ? (
              <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#06b6d4" /></View>
            ) : allCourses.map((course: any, idx: number) => {
              const gradients = [
                ['#3b82f6', '#1d4ed8'],
                ['#10b981', '#047857'],
                ['#f59e0b', '#b45309'],
                ['#8b5cf6', '#6d28d9'],
                ['#ec4899', '#be185d'],
              ];
              const cGrad = gradients[idx % gradients.length];

              return (
                <Animated.View entering={FadeInDown.delay(300 + idx * 50).duration(400).springify()} key={course.id} style={{
                  width: 320, borderRadius: 28, overflow: 'hidden',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', 
                  borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                  shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 10 }, elevation: 6,
                }}>
                  {/* Premium Abstract Cover */}
                  <LinearGradient colors={cGrad as [string, string]} start={{x:0,y:0}} end={{x:1,y:1}} style={{ height: 120, padding: 20, justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                       <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                        <Text style={{ fontSize: 10, fontWeight: '900', color: '#fff' }}>
                          {course.category.toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                        <Clock size={12} color="#fff" />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{course.duration}</Text>
                      </View>
                    </View>
                  </LinearGradient>
                  
                  {/* Course Details */}
                  <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: cText, marginBottom: 16, lineHeight: 26 }} numberOfLines={2}>
                      {course.title}
                    </Text>
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(6,182,212,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={16} color="#06b6d4" />
                        </View>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>{course.enrolled} <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>user</Text></Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Trophy size={16} color="#eab308" />
                        <Text style={{ fontSize: 13, fontWeight: '800', color: cText }}>{Math.round((course.completed / (course.enrolled || 1)) * 100)}% <Text style={{ fontSize: 12, fontWeight: '600', color: cSub }}>đạt</Text></Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Dynamic Trainees Progress Table */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>Tiến độ Học viên</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', 
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10,
                shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 2,
              }}>
                <Search size={18} color={cSub} />
                <Text style={{ color: cSub, fontSize: 14, fontWeight: '600' }}>Tìm kiếm học viên, khóa học...</Text>
              </View>
            </View>
          </View>
          
          <View style={{
            backgroundColor: isDark ? 'rgba(30,41,59,0.35)' : '#ffffff',
            borderRadius: 28, overflow: 'hidden',
            borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            ...(Platform.OS === 'web' ? { 
              backdropFilter: 'blur(32px)', 
              WebkitBackdropFilter: 'blur(32px)',
              boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.2)' : '0 12px 32px rgba(0,0,0,0.04)' 
            } : {}),
          }}>
            {loadingTrainees ? (
               <View style={{ padding: 60, alignItems: 'center' }}>
                 <ActivityIndicator size="large" color="#06b6d4" />
                 <Text style={{ color: cSub, marginTop: 16, fontSize: 14, fontWeight: '600' }}>Đang tải dữ liệu học tập...</Text>
               </View>
            ) : (
              <SGTable 
                columns={COLUMNS} 
                data={allTrainees} 
                style={{ borderWidth: 0, backgroundColor: 'transparent' }}
              />
            )}
          </View>
        </Animated.View>

      </ScrollView>
    </View>
  );
}
