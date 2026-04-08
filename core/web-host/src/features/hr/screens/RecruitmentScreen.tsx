/**
 * RecruitmentScreen — HR Applicant Tracking System (ATS)
 * Features: Job postings, Premium Kanban pipeline, interview scheduling
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator, Modal, Pressable } from 'react-native';
import { UserPlus, Briefcase, Clock, CheckCircle, Search, Filter, MoreHorizontal, UserCog, Users, MapPin, Star, Sparkles, Bot, X } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { sgds } from '@sgroup/ui/src/theme/theme';
import { SGCard } from '@sgroup/ui/src/ui/components';
import type { HRRole } from '../HRSidebar';
import { useJobs, useCandidates } from '../hooks/useHR';

// Data from API

const STAGES = ['NEW', 'INTERVIEW', 'OFFERRED', 'REJECTED'];

const STAGE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  NEW: { bg: '#eff6ff', text: '#3b82f6', label: 'MỚI ỨNG TUYỂN' },
  INTERVIEW: { bg: '#fef3c7', text: '#d97706', label: 'PHỎNG VẤN' },
  OFFERRED: { bg: '#dcfce7', text: '#16a34a', label: 'ĐÃ OFFER' },
  REJECTED: { bg: '#fee2e2', text: '#dc2626', label: 'TỪ CHỐI' },
};

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export function RecruitmentScreen({ userRole }: { userRole?: HRRole }) {
  const { theme, isDark } = useAppTheme();
  const cText = theme.colors.textPrimary;
  const cSub = theme.colors.textSecondary;
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : '#ffffff';
  const borderColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  const { data: rawJobs, isLoading: loadingJobs } = useJobs();
  const { data: rawCandidates, isLoading: loadingCandidates } = useCandidates();

  const safeJobs = Array.isArray(rawJobs) ? rawJobs : (rawJobs as any)?.data ?? [];
  const safeCandidates = Array.isArray(rawCandidates) ? rawCandidates : (rawCandidates as any)?.data ?? [];

  const [aiModalCandidate, setAiModalCandidate] = useState<any>(null);

  const allJobs = safeJobs.map((j: any) => ({
    id: j.id,
    title: j.title,
    dept: j.department || '',
    type: j.type,
    location: j.location || '',
    candidates: j._count?.applicants ?? j.candidates ?? 0,
    status: j.status,
  }));

  const allCandidates = safeCandidates.map((c: any) => ({
    id: c.id,
    name: c.name,
    job: c.job?.title || '',
    source: c.source || '',
    date: new Date(c.createdAt).toLocaleDateString('vi-VN'),
    stage: c.stage,
    rating: c.rating || '-',
    fitScore: Math.floor(Math.random() * 20) + 75, // Mock AI Fit Score 75-95%
  }));

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.colors.background : theme.colors.backgroundAlt }}>
      {/* ── AI Screening Modal ── */}
      <Modal visible={!!aiModalCandidate} transparent animationType="slide" onRequestClose={() => setAiModalCandidate(null)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }} onPress={() => setAiModalCandidate(null)}>
          <Pressable style={{ width: '100%', maxWidth: 500, backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 32, padding: 32, ...(Platform.OS === 'web' ? { boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' } : {}) }} onPress={() => {}}>
            {aiModalCandidate && (
              <View>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                    <LinearGradient colors={['#8b5cf6', '#6366f1']} style={{ width: 56, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}>
                      <Bot size={28} color="#fff" />
                    </LinearGradient>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Sparkles size={16} color="#8b5cf6" />
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: 0.5 }}>AI Resume Parsing</Text>
                      </View>
                      <Text style={{ fontSize: 24, fontWeight: '900', color: cText, marginTop: 4 }}>{aiModalCandidate.name}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: cSub, marginTop: 2 }}>Ứng tuyển: {aiModalCandidate.job}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setAiModalCandidate(null)} style={{ padding: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 12 }}>
                    <X size={20} color={cSub} />
                  </TouchableOpacity>
                </View>

                {/* Score Circular Display Mock */}
                <View style={{ padding: 24, borderRadius: 24, backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : '#f3f0ff', borderWidth: 1, borderColor: isDark ? 'rgba(139,92,246,0.2)' : '#ede9fe', flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 24 }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 6, borderColor: '#8b5cf6', alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#1e293b' : '#fff' }}>
                    <Text style={{ fontSize: 20, fontWeight: '900', color: '#8b5cf6' }}>{aiModalCandidate.fitScore}%</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: cText, marginBottom: 4 }}>Mức độ Phù hợp: RẤT CAO</Text>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: cSub, lineHeight: 20 }}>
                      Kinh nghiệm của ứng viên rất khớp với yêu cầu của vị trí {aiModalCandidate.job}. Kỹ năng chuyên môn đạt yêu cầu 90%.
                    </Text>
                  </View>
                </View>

                {/* Key Insights */}
                <View style={{ gap: 16 }}>
                  <View style={{ gap: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: cText, textTransform: 'uppercase' }}>Điểm mạnh nổi bật</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {['3 năm kinh nghiệm', 'Kỹ năng giao tiếp tốt', 'Phù hợp văn hóa'].map(t => (
                        <View key={t} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <CheckCircle size={14} color="#16a34a" />
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#16a34a' }}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <View style={{ gap: 8, marginTop: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: cText, textTransform: 'uppercase' }}>Cần lưu ý</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: isDark ? 'rgba(245,158,11,0.15)' : '#fef3c7', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                         <Text style={{ fontSize: 13, fontWeight: '700', color: '#d97706' }}>Thiếu kinh nghiệm quản lý nhóm lớn</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 32 }}>
                  <TouchableOpacity onPress={() => setAiModalCandidate(null)} style={{ flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: cSub }}>Đóng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setAiModalCandidate(null)} style={{ flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', backgroundColor: '#8b5cf6', flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: '#8b5cf6', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }}>
                    <CheckCircle size={16} color="#fff" />
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Duyệt CV Này</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: 32, gap: 32, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Premium Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <LinearGradient 
              colors={['#f59e0b', '#d97706']} start={{x:0,y:0}} end={{x:1,y:1}}
              style={{ width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', 
                     shadowColor: '#f59e0b', shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 }}
            >
              <UserPlus size={28} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={{ fontSize: 32, fontWeight: '900', color: cText, letterSpacing: -1 }}>Tuyển Dụng (ATS)</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#94a3b8', marginTop: 4 }}>Quản lý Quy trình & Hồ sơ ứng viên</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={{
              backgroundColor: '#f59e0b', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16,
              shadowColor: '#f59e0b', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4,
              ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
            }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff', letterSpacing: 0.5 }}>TẠO TIN TUYỂN DỤNG</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Stats Summary */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'VỊ TRÍ ĐANG TUYỂN', val: '3', unit: 'jobs', icon: Briefcase, color: '#f59e0b', shadow: '#f59e0b' },
            { label: 'TỔNG CV MỚI (Tháng)', val: '89', unit: 'CVs', icon: UserPlus, color: '#3b82f6', shadow: '#3b82f6' },
            { label: 'ĐANG PHỎNG VẤN', val: '14', unit: 'người', icon: Clock, color: '#8b5cf6', shadow: '#8b5cf6' },
            { label: 'NHẬN VIỆC (Tháng)', val: '5', unit: 'người', icon: CheckCircle, color: '#10b981', shadow: '#10b981' },
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

        {/* Active Jobs Horizon List */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={{ fontSize: 20, fontWeight: '900', color: cText, marginBottom: 20 }}>Vị trí Đang mở</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 20 }}>
            {loadingJobs ? (
              <View style={{ padding: 40, alignItems: 'center' }}><ActivityIndicator size="large" color="#f59e0b" /></View>
            ) : allJobs.map((job: any, idx: number) => (
              <Animated.View entering={FadeInDown.delay(300 + idx * 50).duration(400).springify()} key={job.id} style={{
                width: 300, padding: 24, borderRadius: 24,
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#ffffff', 
                borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                shadowColor: '#000', shadowOpacity: isDark ? 0.3 : 0.04, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 4,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                  <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: job.status === 'OPEN' ? 'rgba(34,197,94,0.15)' : job.status === 'URGENT' ? 'rgba(220,38,38,0.15)' : 'rgba(100,116,139,0.15)' }}>
                    <Text style={{ fontSize: 11, fontWeight: '900', color: job.status === 'OPEN' ? '#16a34a' : job.status === 'URGENT' ? '#dc2626' : '#64748b' }}>
                      {job.status}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MapPin size={14} color={cSub} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: cSub }}>{job.location}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '900', color: cText, marginBottom: 6 }}>{job.title}</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: cSub, marginBottom: 24 }}>{job.dept} • {job.type}</Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(59,130,246,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={16} color="#3b82f6" />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: cText }}>{job.candidates} <Text style={{ fontSize: 13, fontWeight: '600', color: cSub }}>CVs</Text></Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#f59e0b' }}>Chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* KANBAN BOARD for Candidates */}
        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: cText }}>Pipeline Ứng viên</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: cSub, marginTop: 4 }}>Kéo thả ứng viên để thay đổi trạng thái (Web)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor }}>
              <Search size={18} color={cSub} />
              <Text style={{ color: cSub, fontSize: 14, fontWeight: '600' }}>Tìm kiếm ứng viên...</Text>
            </View>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 24 }}>
            {STAGES.map((stage, sIdx) => {
              const conf = STAGE_CONFIG[stage];
              const stageCandidates = allCandidates.filter((c: any) => c.stage === stage);
              
              return (
                <Animated.View entering={FadeInDown.delay(400 + sIdx * 50).duration(400).springify()} key={stage} style={{ 
                  width: 320, 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', 
                  borderRadius: 24, 
                  padding: 16,
                  borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9',
                }}>
                  {/* Column Header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: conf.text }} />
                      <Text style={{ fontSize: 14, fontWeight: '800', color: cText }}>{conf.label}</Text>
                    </View>
                    <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: cText }}>{stageCandidates.length}</Text>
                    </View>
                  </View>

                  {/* Candidate Cards */}
                  <View style={{ gap: 16 }}>
                    {loadingCandidates ? (
                       <ActivityIndicator color={conf.text} style={{ padding: 20 }} />
                    ) : stageCandidates.length === 0 ? (
                      <View style={{ padding: 30, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1', borderRadius: 16 }}>
                        <Text style={{ color: cSub, fontSize: 13, fontWeight: '600' }}>Trống</Text>
                      </View>
                    ) : stageCandidates.map((c: any, cIdx: number) => (
                      <AnimatedTouchableOpacity 
                        entering={FadeInDown.delay(500 + sIdx * 50 + cIdx * 30).duration(300).springify()}
                        key={c.id} 
                        style={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        borderRadius: 16, padding: 16,
                        borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
                        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2,
                        ...(Platform.OS === 'web' ? { cursor: 'pointer' as any } : {}),
                      }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: cText, marginBottom: 2 }}>{c.name}</Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#3b82f6' }}>{c.job}</Text>
                          </View>
                          <TouchableOpacity onPress={() => setAiModalCandidate(c)} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(139,92,246,0.15)', flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Sparkles size={12} color="#8b5cf6" />
                            <Text style={{ fontSize: 11, fontWeight: '800', color: '#8b5cf6' }}>{c.fitScore}% FIT</Text>
                          </TouchableOpacity>
                        </View>
                        
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Star size={14} color={c.rating.startsWith('9') || c.rating.startsWith('8') ? '#10b981' : '#f59e0b'} fill={c.rating.startsWith('9') || c.rating.startsWith('8') ? '#10b981' : '#f59e0b'} />
                            <Text style={{ fontSize: 13, fontWeight: '700', color: cSub }}>
                              {c.rating !== '-' ? `${c.rating}/10` : 'Chưa đánh giá'}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8' }}>{c.date}</Text>
                        </View>
                      </AnimatedTouchableOpacity>
                    ))}
                  </View>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>

      </ScrollView>
    </View>
  );
}
