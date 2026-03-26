/**
 * Training — Trung tâm Đào tạo cho NVKD
 * Danh sách khóa học, tiến độ, chứng chỉ
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import {
  GraduationCap, Play, CheckCircle2, Clock, Star, Award, BookOpen, Video, FileText, Lock
} from 'lucide-react-native';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { SGPlanningSectionTitle } from '../../../../shared/ui/components';
import { useAuthStore } from '../../../auth/store/authStore';

type CourseStatus = 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' | 'LOCKED';

type Course = {
  id: string;
  title: string;
  category: string;
  duration: string;
  lessons: number;
  completed: number;
  status: CourseStatus;
  instructor: string;
  rating?: number;
};

const STATUS_CFG: Record<CourseStatus, { label: string; color: string }> = {
  COMPLETED:   { label: 'HOÀN THÀNH', color: '#22c55e' },
  IN_PROGRESS: { label: 'ĐANG HỌC',  color: '#3b82f6' },
  NOT_STARTED: { label: 'CHƯA BẮT ĐẦU', color: '#f59e0b' },
  LOCKED:      { label: 'CHƯA MỞ',    color: '#94a3b8' },
};

const courses: Course[] = [];

const certs: { id: string; name: string; date: string; expiry: string; status: string }[] = [];

export function Training() {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const [tab, setTab] = useState<'courses' | 'certs'>('courses');
  const { user } = useAuthStore();

  const completedCount = courses.filter(c => c.status === 'COMPLETED').length;
  const inProgressCount = courses.filter(c => c.status === 'IN_PROGRESS').length;
  const totalHours = courses.filter(c => c.status === 'COMPLETED').reduce((s, c) => s + parseInt(c.duration), 0);

  const cardStyle: any = {
    backgroundColor: isDark ? 'rgba(20,24,35,0.45)' : '#fff', borderRadius: 24,
    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      <ScrollView contentContainerStyle={{ padding: 32, gap: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#8b5cf6', textTransform: 'uppercase', marginBottom: 4 }}>HỌC TẬP & PHÁT TRIỂN</Text>
          <Text style={{ fontSize: 28, fontWeight: '900', color: cText, letterSpacing: -0.5 }}>Trung Tâm Đào Tạo — {user?.name || 'User'}</Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'KHÓA HỌC HOÀN THÀNH', value: completedCount, total: courses.length, color: '#22c55e', icon: CheckCircle2 },
            { label: 'ĐANG HỌC', value: inProgressCount, total: null, color: '#3b82f6', icon: BookOpen },
            { label: 'GIỜ HỌC TÍCH LŨY', value: totalHours, total: null, color: '#8b5cf6', icon: Clock },
            { label: 'CHỨNG CHỈ', value: certs.length, total: null, color: '#f59e0b', icon: Award },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <View key={i} style={{ flex: 1, minWidth: 180, padding: 20, borderRadius: 20, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${s.color}15`, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={18} color={s.color} />
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: cSub, letterSpacing: 0.5 }}>{s.label}</Text>
                </View>
                <Text style={{ fontSize: 32, fontWeight: '900', color: s.color }}>
                  {s.value}{s.total ? <Text style={{ fontSize: 16, fontWeight: '700', color: cSub }}>/{s.total}</Text> : ''}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Tab Switch */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { key: 'courses', label: 'Khóa Học', icon: BookOpen },
            { key: 'certs', label: 'Chứng Chỉ', icon: Award },
          ].map((t) => {
            const TabIcon = t.icon;
            return (
              <TouchableOpacity key={t.key} onPress={() => setTab(t.key as any)} style={{
                flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
                backgroundColor: tab === t.key ? '#8b5cf6' : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
              }}>
                <TabIcon size={16} color={tab === t.key ? '#fff' : cSub} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: tab === t.key ? '#fff' : cSub }}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Courses List */}
        {tab === 'courses' && (
          <View style={{ gap: 12 }}>
            {courses.map(course => {
              const cfg = STATUS_CFG[course.status];
              const progress = course.lessons > 0 ? Math.round((course.completed / course.lessons) * 100) : 0;
              const isLocked = course.status === 'LOCKED';
              return (
                <TouchableOpacity key={course.id} disabled={isLocked} style={[cardStyle, { padding: 24, flexDirection: 'row', alignItems: 'center', opacity: isLocked ? 0.5 : 1 }]}>
                  {/* Icon */}
                  <View style={{
                    width: 56, height: 56, borderRadius: 18, marginRight: 20,
                    backgroundColor: isDark ? `${cfg.color}15` : `${cfg.color}10`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isLocked ? <Lock size={24} color={cfg.color} /> :
                     course.status === 'COMPLETED' ? <CheckCircle2 size={24} color={cfg.color} /> :
                     course.status === 'IN_PROGRESS' ? <Play size={24} color={cfg.color} /> :
                     <BookOpen size={24} color={cfg.color} />}
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: cText, flex: 1 }} numberOfLines={1}>{course.title}</Text>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, backgroundColor: `${cfg.color}15` }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: cfg.color }}>{cfg.label}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: cSub, marginBottom: 8 }}>
                      {course.instructor} • {course.duration} • {course.lessons} bài
                    </Text>

                    {/* Progress Bar */}
                    {course.status !== 'LOCKED' && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', overflow: 'hidden' }}>
                          <View style={{ width: `${progress}%`, height: '100%', borderRadius: 3, backgroundColor: cfg.color }} />
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: cfg.color, width: 40, textAlign: 'right' }}>{progress}%</Text>
                      </View>
                    )}

                    {course.rating && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                        <Star size={12} color="#f59e0b" />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#f59e0b' }}>{course.rating}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Certificates List */}
        {tab === 'certs' && (
          <View style={{ gap: 12 }}>
            {certs.map(cert => (
              <View key={cert.id} style={[cardStyle, { padding: 24, flexDirection: 'row', alignItems: 'center' }]}>
                <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb', alignItems: 'center', justifyContent: 'center', marginRight: 20 }}>
                  <Award size={26} color="#f59e0b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: cText, marginBottom: 4 }}>{cert.name}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>
                    Cấp ngày: {cert.date}{cert.expiry ? ` • Hết hạn: ${cert.expiry}` : ''}
                  </Text>
                </View>
                <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#bbf7d0' }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#16a34a' }}>CÒN HIỆU LỰC</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
