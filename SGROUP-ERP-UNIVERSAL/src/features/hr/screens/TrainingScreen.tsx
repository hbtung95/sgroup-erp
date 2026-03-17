/**
 * TrainingScreen — HR Learning & Development (L&D)
 * Features: Training programs, compliance courses, employee progress
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { GraduationCap, FileText, CheckCircle, Clock, Search, MoreHorizontal, BookOpen, User, PlayCircle } from 'lucide-react-native';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds } from '../../../shared/theme/theme';
import { SGCard, SGTable } from '../../../shared/ui/components';
import type { HRRole } from '../HRSidebar';
import { useCourses, useTrainees } from '../hooks/useHR';

// Data from API

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  COMPLETED: { bg: '#dcfce7', text: '#16a34a', label: 'HOÀN THÀNH' },
  IN_PROGRESS: { bg: '#fef3c7', text: '#d97706', label: 'ĐANG HỌC' },
  NOT_STARTED: { bg: '#fee2e2', text: '#dc2626', label: 'CHƯA HỌC' },
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
    { key: 'course', title: 'KHÓA HỌC', flex: 1.5, render: (v: any) => <Text style={{ fontSize: 12, fontWeight: '600', color: cText }}>{v}</Text> },
    { key: 'progress', title: 'TIẾN ĐỘ', flex: 1, align: 'center', render: (v: any) => (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: v === 100 ? '#10b981' : cText }}>{v}%</Text>
        <View style={{ width: '100%', height: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', borderRadius: 2, marginTop: 4 }}>
          <View style={{ width: `${v}%`, height: '100%', backgroundColor: v === 100 ? '#10b981' : '#3b82f6', borderRadius: 2 }} />
        </View>
      </View>
    ) },
    { key: 'score', title: 'ĐIỂM SỐ', flex: 0.8, align: 'center', render: (v: any) => (
      <Text style={{ fontSize: 13, fontWeight: '800', color: v !== '-' ? '#8b5cf6' : cSub }}>{v}</Text>
    ) },
    { key: 'status', title: 'TRẠNG THÁI', flex: 1, align: 'center', render: (v: any) => {
      const s = STATUS_CONFIG[v];
      return (
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: s.bg, alignSelf: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: s.text }}>{s.label}</Text>
        </View>
      );
    } },
    { key: 'actions', title: '', flex: 0.5, align: 'right', render: () => (
      <TouchableOpacity style={{ padding: 6 }}>
        <MoreHorizontal size={16} color={cSub} />
      </TouchableOpacity>
    ) }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 28, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: '#3b82f620', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={24} color="#3b82f6" />
            </View>
            <View>
              <Text style={{ ...sgds.typo.h2, color: cText }}>Đào tạo & L&D</Text>
              <Text style={{ ...sgds.typo.body, color: cSub, marginTop: 2 }}>Khóa học nội bộ & Phát triển năng lực</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={{
              backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>TẠO KHÓA HỌC</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'KHÓA ĐANG MỞ', val: '12', unit: 'khóa', icon: BookOpen, color: '#3b82f6' },
            { label: 'GIỜ ĐÀO TẠO YTD', val: '1,420', unit: 'giờ', icon: Clock, color: '#f59e0b' },
            { label: 'TỈ LỆ CẤP CHỨNG CHỈ', val: '85', unit: '%', icon: CheckCircle, color: '#10b981' },
            { label: 'CHƯA HOÀN THÀNH', val: '38', unit: 'user', icon: User, color: '#ef4444' },
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

        {/* Current Courses */}
        <View>
          <Text style={{ fontSize: 16, fontWeight: '800', color: cText, marginBottom: 16 }}>Khóa học nổi bật</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
            {loadingCourses ? (
              <View style={{ padding: 30, alignItems: 'center' }}><ActivityIndicator size="large" color="#ec4899" /></View>
            ) : allCourses.map((course: any) => (
              <View key={course.id} style={{
                width: 280, padding: 20, borderRadius: 20,
                backgroundColor: cardBg, borderWidth: 1, borderColor,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: course.status === 'OPEN' ? '#eff6ff' : '#fee2e2' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: course.status === 'OPEN' ? '#3b82f6' : '#dc2626' }}>
                      {course.category.toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <PlayCircle size={12} color={cSub} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>{course.duration}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: cText, marginBottom: 16 }} numberOfLines={2}>{course.title}</Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: borderColor }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <User size={14} color={cSub} />
                    <Text style={{ fontSize: 13, fontWeight: '700', color: cSub }}>{course.enrolled} học viên</Text>
                  </View>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#dcfce7' }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#16a34a' }}>Đạt: {Math.round((course.completed / course.enrolled)*100)}%</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Trainees Progress Table */}
        <View style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: cText }}>Tiến độ học viên</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: cardBg, borderWidth: 1, borderColor, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Search size={16} color={cSub} />
                <Text style={{ color: cSub, fontSize: 13 }}>Tìm nhân viên, khóa học...</Text>
              </View>
            </View>
          </View>
          
          <SGCard variant="glass" noPadding>
            <SGTable 
              columns={COLUMNS} 
              data={allTrainees} 
              style={{ borderWidth: 0, backgroundColor: 'transparent' }}
            />
          </SGCard>
        </View>

      </ScrollView>
    </View>
  );
}
