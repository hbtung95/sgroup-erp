import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {ArrowLeft, User, Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck, Award, FileLock2, PenTool, Download, Lock, TrendingUp, CheckCircle, Clock, BookOpen, Star} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAppTheme } from '../../../shared/theme/useAppTheme';
import { sgds, typography, radius } from '../../../shared/theme/theme';
import { useResponsive } from '../../../shared/hooks/useResponsive';
import { useAuthStore } from '../../auth/store/authStore';
import { SGPageContainer, SGSection, SGTag, SGDataGrid, SGAuroraBackground, SGPillSelector, SGGradientStatCard, SGKpiCard, SGProgressBar, SGTimeline } from '../../../shared/ui';

export function EmployeeProfileScreen() {
  const navigation = useNavigation<any>();
  const { theme, colors, isDark } = useAppTheme();
  const { isMobile } = useResponsive();
  const user = useAuthStore((s) => s.user);

  const [activeTab, setActiveTab] = useState('overview');

  const primaryColor = colors.brand; // Use SGDS brand token instead of hardcoded HR color
  
  const TABS = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'skills', label: 'Kỹ năng & Hiệu suất' },
    { key: 'timeline', label: 'Hành trình' },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <Animated.View
         entering={FadeInDown.duration(400)}
         style={[
           styles.topBar,
           {
             borderBottomColor: colors.border,
             backgroundColor: isDark ? 'rgba(12,18,29,0.86)' : 'rgba(255,255,255,0.88)',
           },
           Platform.OS === 'web' ? ({ ...sgds.glass } as any) : null,
         ]}
       >
         <TouchableOpacity
           onPress={() => navigation.goBack()}
           style={[
             styles.backButton,
             { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' },
             Platform.OS === 'web' ? (sgds.cursor as any) : null,
           ]}
         >
           <ArrowLeft size={16} color={colors.text} />
         </TouchableOpacity>
 
         <View style={styles.topBarTitleWrap}>
           <Text style={[typography.h4, { color: colors.text }]}>Hồ Sơ Nhân Sự</Text>
           <Text style={[typography.caption, { color: colors.textTertiary }]}>Thông tin chi tiết và hiệu suất làm việc</Text>
         </View>
      </Animated.View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Animated Aurora Cover Background */}
        <View style={{ height: 180, position: 'absolute', top: 0, left: 0, right: 0 }}>
          <SGAuroraBackground />
        </View>

        <SGPageContainer padding={isMobile ? 16 : 24} maxWidth={1000}>
          <View style={{ gap: isMobile ? 16 : 24 }}>
            {/* Header Card */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(400)}
              style={[
                styles.profileHeaderCard,
                sgds.sectionBase(theme),
                {
                  marginTop: 60, // Push down to overlap aurora cover
                  shadowColor: isDark ? 'rgba(14, 165, 233, 0.12)' : 'rgba(0,0,0,0.05)', // shadowGlow or subtle shadow
                  elevation: 8,
                },
              ]}
            >
              <View style={[styles.avatarContainer, { backgroundColor: `${primaryColor}20`, borderColor: colors.brand, borderWidth: 2 }]}>
                <User size={54} color={primaryColor} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[typography.h1, { color: colors.text, marginBottom: 4 }]}>
                  {user?.name || 'Nguyễn Văn A'}
                </Text>
                <Text style={[typography.bodyBold, { color: primaryColor, marginBottom: 16 }]}>
                  {user?.role || 'Chuyên Viên Nhân Sự (HR)'}
                </Text>

                <View style={styles.tagsContainer}>
                  <SGTag label="Đang làm việc" variant="solid" color={colors.success} size="md" />
                  <SGTag label="S-Group Hội Sở" variant="soft" color={colors.info} size="md" />
                  <SGTag label="Full-time" variant="soft" color={colors.textSecondary} size="md" />
                </View>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
              <SGPillSelector
                options={TABS}
                activeKey={activeTab}
                onChange={setActiveTab}
                style={{ alignSelf: 'flex-start' }}
              />
            </Animated.View>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <View style={[styles.contentRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ flex: 1, gap: isMobile ? 16 : 24 }}>
                  <SGSection title="Thông tin liên hệ" titleIcon={<User size={18} color={primaryColor} />} titleColor={primaryColor}>
                    <View style={styles.detailList}>
                      <DetailItem icon={Mail} label="Email" value={user?.email || 'nguyenvana@sgroup.vn'} colors={colors} />
                      <DetailItem icon={Phone} label="Điện thoại" value="+84 987 654 321" colors={colors} />
                      <DetailItem icon={MapPin} label="Địa chỉ" value="Tòa nhà S-Group, Quận 1, TP.HCM" colors={colors} />
                    </View>
                  </SGSection>

                  <SGSection title="Thông tin công việc" titleIcon={<Briefcase size={18} color={primaryColor} />} titleColor={primaryColor}>
                    <View style={styles.detailList}>
                      <DetailItem icon={Briefcase} label="Phòng ban" value="Phòng Nhân Sự (HR)" colors={colors} />
                      <DetailItem icon={Calendar} label="Ngày gia nhập" value="15/03/2023" colors={colors} />
                      <DetailItem icon={ShieldCheck} label="Mã nhân viên" value="SG-HR-0042" colors={colors} />
                    </View>
                  </SGSection>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ flex: 1, gap: isMobile ? 16 : 24 }}>
                  <SGSection title="Tổng quan nhanh" titleIcon={<TrendingUp size={18} color={colors.success} />} titleColor={colors.success}>
                    <SGDataGrid gap={12} minItemWidth={140}>
                      <SGGradientStatCard 
                        label="KPI Hiện Tại" 
                        value="95%" 
                        change={5} 
                        icon={<Award size={16} color="#fff" />} 
                        color="#0ea5e9"
                      />
                      <SGGradientStatCard 
                        label="Nhiệm vụ Hoàn thành" 
                        value="142" 
                        icon={<CheckCircle size={16} color="#fff" />} 
                        color="#F59E0B"
                      />
                    </SGDataGrid>
                  </SGSection>
                  
                  {/* Self-Service (ESS) Widgets */}
                  <SGSection title="Tài liệu & Chứng từ (ESS)" titleIcon={<FileLock2 size={18} color="#ec4899" />} titleColor="#ec4899">
                    <View style={{ gap: 16 }}>
                      {/* Secure Payslip */}
                      <TouchableOpacity style={[
                        styles.essCard,
                        {
                          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                          borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'
                        },
                        Platform.OS === 'web' ? { ...sgds.transition.fast, ...(sgds.cursor as any) } : {}
                      ]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <View style={[styles.essIconWrapper, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                            <FileLock2 size={20} color="#10b981" />
                          </View>
                          <View>
                            <Text style={[typography.h4, { color: colors.text }]}>Phiếu lương Tháng 02/2026</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                              <Lock size={12} color={colors.textSecondary} />
                              <Text style={[typography.caption, { color: colors.textSecondary }]}>Yêu cầu mật khẩu để mở</Text>
                            </View>
                          </View>
                        </View>
                        <View style={[styles.essActionIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
                          <Download size={16} color={colors.textSecondary} />
                        </View>
                      </TouchableOpacity>

                      {/* E-Signature Pending */}
                      <TouchableOpacity style={[
                        styles.essCard,
                        {
                          backgroundColor: 'rgba(59,130,246,0.05)',
                          borderColor: 'rgba(59,130,246,0.2)'
                        },
                        Platform.OS === 'web' ? { ...sgds.transition.fast, ...(sgds.cursor as any) } : {}
                      ]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <View style={[styles.essIconWrapper, { backgroundColor: '#3b82f6', shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}>
                            <PenTool size={20} color="#fff" />
                          </View>
                          <View>
                            <Text style={[typography.h4, { color: '#3b82f6' }]}>Phụ lục HĐLĐ 2026</Text>
                            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>Cần chữ ký số (e-Signature) của bạn</Text>
                          </View>
                        </View>
                        <Text style={[typography.smallBold, { color: '#3b82f6' }]}>KÝ NGAY</Text>
                      </TouchableOpacity>
                    </View>
                  </SGSection>
                </Animated.View>
              </View>
            )}

            {/* Tab 2: Skills & Performance */}
            {activeTab === 'skills' && (
               <View style={[styles.contentRow, { flexDirection: isMobile ? 'column' : 'row' }]}>
                  <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ flex: 1, gap: isMobile ? 16 : 24 }}>
                    <SGSection title="Chỉ số KPIs cốt lõi" titleIcon={<Star size={18} color={colors.warning} />} titleColor={colors.warning}>
                        <View style={{ gap: 16 }}>
                           <SGKpiCard title="Chăm sóc nhân viên" value="85%" trend={12} />
                           <SGKpiCard title="Tuyển dụng" value="7" trend={-2} />
                           <SGKpiCard title="Đào tạo hội nhập" value="4" trend={0} />
                        </View>
                    </SGSection>
                  </Animated.View>
                  <Animated.View entering={FadeInDown.delay(300).duration(400)} style={{ flex: 1, gap: isMobile ? 16 : 24 }}>
                     <SGSection title="Kỹ năng chuyên môn" titleIcon={<Award size={18} color={primaryColor} />} titleColor={primaryColor}>
                        <View style={{ gap: 20 }}>
                           <View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                 <Text style={[typography.bodyBold, { color: colors.text }]}>Luật Lao Động</Text>
                                 <Text style={[typography.body, { color: colors.textSecondary }]}>90%</Text>
                              </View>
                              <SGProgressBar progress={90} color={colors.success} size="md" />
                           </View>
                           <View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                 <Text style={[typography.bodyBold, { color: colors.text }]}>Đánh giá Năng lực</Text>
                                 <Text style={[typography.body, { color: colors.textSecondary }]}>75%</Text>
                              </View>
                              <SGProgressBar progress={75} color={colors.brand} size="md" />
                           </View>
                           <View>
                              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                 <Text style={[typography.bodyBold, { color: colors.text }]}>Data Analytics HR</Text>
                                 <Text style={[typography.body, { color: colors.textSecondary }]}>50%</Text>
                              </View>
                              <SGProgressBar progress={50} color={colors.warning} size="md" />
                           </View>
                        </View>
                     </SGSection>
                  </Animated.View>
               </View>
            )}

            {/* Tab 3: Timeline */}
            {activeTab === 'timeline' && (
              <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <SGSection title="Hành trình phát triển" titleIcon={<Clock size={18} color={colors.textSecondary} />}>
                  <SGTimeline 
                    items={[
                      {
                        title: 'Đánh giá xuất sắc (Q1/2026)',
                        description: 'Đạt danh hiệu nhân viên xuất sắc quý 1.',
                        time: '15/03/2026',
                        icon: <Star size={14} color="#F59E0B" />
                      },
                      {
                        title: 'Thăng tiến',
                        description: 'Chuyên viên Nhân sự (HR)',
                        time: '01/01/2025',
                        icon: <TrendingUp size={14} color="#10B981" />
                      },
                      {
                        title: 'Hoàn thành thử việc',
                        description: 'Chính thức gia nhập S-Group',
                        time: '15/05/2023',
                      },
                      {
                        title: 'Gia nhập S-Group',
                        description: 'Vị trí Thực tập sinh Nhân sự',
                        time: '15/03/2023',
                        icon: <CheckCircle size={14} color="#3B82F6" />
                      }
                    ]} 
                  />
                </SGSection>
              </Animated.View>
            )}
            
          </View>
        </SGPageContainer>
      </ScrollView>
    </View>
  );
}

const DetailItem = ({ icon: Icon, label, value, colors }: any) => (
  <View style={styles.detailItem}>
    <View style={[styles.detailIcon, { backgroundColor: colors.bgCard }]}>
      <Icon size={16} color={colors.textSecondary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[typography.caption, { color: colors.textTertiary, marginBottom: 2 }]}>{label}</Text>
      <Text style={[typography.body, { color: colors.text }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
    zIndex: 10,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitleWrap: { flex: 1, gap: 2 },
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 24,
    zIndex: 2,
  },
  avatarContainer: {
    width: 108,
    height: 108,
    borderRadius: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contentRow: {
    gap: 24,
  },
  detailList: {
    gap: 16,
    paddingVertical: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  essCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  essIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  essActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
