/**
 * SGROUP ERP — HR Module Shell
 * Main app shell with role-based Sidebar + TopBar + Content Area for HR Module
 */
import React, { useState, useMemo, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, Platform, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { Bot, Command, Search, X, Send, Sparkles, FileText, Users, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HRSidebar, HRSidebarItem, HRRole } from './HRSidebar';
import { SGTopBar } from '../../shared/ui';
import { useTheme, typography } from '../../shared/theme/theme';
import { useThemeStore } from '../../shared/theme/themeStore';
import { useAuthStore } from '../auth/store/authStore';
import { useHRRoute } from './hooks/useHRRoute';

// Import Screens
import { EmployeeProfileScreen } from './screens/EmployeeProfileScreen';
import { HRDashboard } from './screens/HRDashboard';
import { StaffDirectoryScreen } from './screens/StaffDirectoryScreen';
import { TimekeepingScreen } from './screens/TimekeepingScreen';
import { PayrollScreen } from './screens/PayrollScreen';
import { PerformanceScreen } from './screens/PerformanceScreen';
import { RecruitmentScreen } from './screens/RecruitmentScreen';
import { TrainingScreen } from './screens/TrainingScreen';
import { LeavesScreen } from './screens/LeavesScreen';
import { BenefitsScreen } from './screens/BenefitsScreen';
import { PoliciesScreen } from './screens/PoliciesScreen';

const KEY_TO_COMPONENT: Record<string, React.ComponentType<any>> = {
  HR_DASHBOARD: HRDashboard,
  HR_DIRECTORY: StaffDirectoryScreen,
  HR_PROFILE: EmployeeProfileScreen,
  HR_TIMEKEEPING: TimekeepingScreen,
  HR_LEAVES: LeavesScreen,
  HR_PAYROLL: PayrollScreen,
  HR_BENEFITS: BenefitsScreen,
  HR_PERFORMANCE: PerformanceScreen,
  HR_RECRUITMENT: RecruitmentScreen,
  HR_TRAINING: TrainingScreen,
  HR_POLICIES: PoliciesScreen,
  // Other keys will use the placeholder for now
};

export function HRShell() {
  const validKeys = useMemo(() => [
    'HR_DASHBOARD', 'HR_DIRECTORY', 'HR_PROFILE', 'HR_TIMEKEEPING', 'HR_LEAVES',
    'HR_PAYROLL', 'HR_BENEFITS', 'HR_RECRUITMENT', 'HR_PERFORMANCE', 'HR_TRAINING', 'HR_POLICIES'
  ], []);
  
  const { activeKey, navigate } = useHRRoute(validKeys);
  const [activeLabel, setActiveLabel] = useState('Tổng quan HR');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  
  // Phase 2: Tier-S Global Features
  const [isCopilotOpen, setCopilotOpen] = useState(false);
  const [isCommandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'ai'|'user', val: string}[]>([
    { role: 'ai', val: 'Chào bạn, tôi là HR Copilot. Tôi có thể giúp gì cho bạn hôm nay? (Ví dụ: "Hôm nay ai nghỉ phép?", "Tính lương tháng 3", v.v.)' }
  ]);

  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();

  // Determine HR role
  const userRole: HRRole = user?.role === 'admin' ? 'admin' : 'hr_staff'; // Default role if not provided

  // Command Palette Cmd+K Listener
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelect = (item: HRSidebarItem) => {
    navigate(item.key);
    setActiveLabel(item.label);
    setActiveSection(item.section);
  };

  const ContentComponent = KEY_TO_COMPONENT[activeKey];

  const sectionLabels: Record<string, string> = {
    dashboard: 'TỔNG QUAN',
    directory: 'HỒ SƠ NHÂN SỰ',
    time_attendance: 'CHẤM CÔNG & NGHỈ PHÉP',
    payroll: 'LƯƠNG THƯỞNG (C&B)',
    recruitment: 'TUYỂN DỤNG',
    performance_training: 'ĐÁNH GIÁ & ĐÀO TẠO',
    admin: 'QUẢN TRỊ & HÀNH CHÍNH',
  };

  const breadcrumb = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={[typography.micro, { color: colors.textTertiary, opacity: 0.8 }]}>
        {sectionLabels[activeSection] || 'HR'}
      </Text>
      <View style={[styles.breadcrumbDot, { backgroundColor: '#ec4899' }]} />
      <Text style={[typography.micro, { color: '#ec4899', fontWeight: '800' }]}>
        {activeLabel.toUpperCase()}
      </Text>
    </View>
  );

  return (
    <View style={[styles.shell, { backgroundColor: isDark ? '#05070A' : '#F8FAFC' }]}>
      {/* Aurora backdrop */}
      {Platform.OS === 'web' && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[styles.aurora, {
            top: '-10%', left: '-5%', width: 1000, height: 1000,
            backgroundColor: isDark ? 'rgba(236,72,153,0.10)' : 'rgba(236,72,153,0.05)',
            filter: 'blur(100px)',
          } as any]} />
          <View style={[styles.aurora, {
            bottom: '-15%', right: '-8%', width: 900, height: 900,
            backgroundColor: isDark ? 'rgba(244,63,94,0.08)' : 'rgba(244,63,94,0.04)',
            filter: 'blur(120px)',
          } as any]} />
        </View>
      )}

      {/* Sidebar */}
      <View style={{ zIndex: 1000 }}>
        <HRSidebar
          activeKey={activeKey}
          onSelect={handleSelect}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
          userRole={userRole}
        />
      </View>

      {/* Main Area */}
      <View style={styles.mainArea}>
        <View style={styles.topBarWrapper}>
          <SGTopBar
            title={activeLabel}
            breadcrumb={breadcrumb}
            userName={user?.name || 'User'}
            userRole={userRole.replace(/_/g, ' ').toUpperCase()}
          />
        </View>
        <View style={styles.content}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {ContentComponent ? (
              <ContentComponent userRole={userRole} />
            ) : (
              <View style={styles.placeholder}>
                <Text style={{ fontSize: 60, marginBottom: 24 }}>🚀</Text>
                <Text style={[typography.h3, { color: colors.text, marginBottom: 8 }]}>Module Đang Phát Triển</Text>
                <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', maxWidth: 400 }]}>
                  Tính năng "{activeLabel}" đang được phát triển.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* ═══ 1. COMMAND PALETTE (Cmd+K) ═══ */}
      <Modal visible={isCommandOpen} transparent animationType="none" onRequestClose={() => setCommandOpen(false)}>
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 9999 }}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setCommandOpen(false)} />
          <Animated.View entering={FadeInDown.duration(300).springify().damping(20)} style={{ width: '100%', maxWidth: 640, backgroundColor: isDark ? '#0f172a' : '#ffffff', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 32, shadowOffset: { width: 0, height: 16 }, elevation: 10, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
             {/* Header Search */}
             <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
                <Search size={22} color="#3b82f6" />
                <TextInput
                   autoFocus
                   value={searchQuery}
                   onChangeText={setSearchQuery}
                   placeholder="Tìm kiếm nhân sự, phòng ban, chính sách..."
                   placeholderTextColor={colors.textTertiary}
                   style={{ flex: 1, height: 64, paddingHorizontal: 16, fontSize: 18, color: colors.text, outlineStyle: 'none' } as any}
                />
                <View style={{ flexDirection: 'row', gap: 4 }}>
                   <View style={{ padding: 4, borderRadius: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}><Command size={14} color={colors.textSecondary} /></View>
                   <View style={{ padding: 4, borderRadius: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}><Text style={{ fontSize: 12, fontWeight: '800', color: colors.textSecondary }}>K</Text></View>
                </View>
             </View>
             {/* Quick Actions / Results */}
             <View style={{ padding: 12, maxHeight: 400 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textTertiary, paddingHorizontal: 8, paddingBottom: 8, paddingTop: 4 }}>HÀNH ĐỘNG NHANH (AI SUGGESTED)</Text>
                {[
                  { icon: FileText, label: 'Tạo biểu mẫu Đánh giá năng lực mới', color: '#8b5cf6' },
                  { icon: Users, label: 'Tra cứu danh sách nhân sự mới on-board', color: '#10b981' },
                  { icon: Calendar, label: 'Duyệt 14 đơn nghỉ phép chờ xử lý', color: '#f59e0b' },
                ].map((act, i) => (
                  <TouchableOpacity key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                     <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${act.color}20`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <act.icon size={16} color={act.color} />
                     </View>
                     <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{act.label}</Text>
                  </TouchableOpacity>
                ))}
             </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* ═══ 2. HR COPILOT (Floating AI Assistant) ═══ */}
      {isCopilotOpen ? (
        <Animated.View entering={SlideInRight.duration(400).springify().damping(20)} exiting={SlideOutRight.duration(300)} style={{ position: 'absolute', right: 24, bottom: 24, width: 380, height: 600, backgroundColor: isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.9)', borderRadius: 28, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', shadowColor: '#ec4899', shadowOpacity: 0.15, shadowRadius: 40, shadowOffset: { width: 0, height: 20 }, elevation: 20, zIndex: 10000, ...(Platform.OS === 'web' ? { backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' } : {}) } as any}>
           {/* Header */}
           <LinearGradient colors={['#ec4899', '#8b5cf6']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={{ padding: 16, borderTopLeftRadius: 28, borderTopRightRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} color="#fff" />
                </View>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: '#fff' }}>HR Copilot</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>AI Assistant for S-Group</Text>
                </View>
             </View>
             <TouchableOpacity onPress={() => setCopilotOpen(false)} style={{ padding: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)' }}>
               <X size={18} color="#fff" />
             </TouchableOpacity>
           </LinearGradient>
           
           {/* Chat Messages */}
           <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ gap: 16 }}>
              {chatMessages.map((msg, i) => (
                <View key={i} style={{ alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end', maxWidth: '85%', padding: 14, borderRadius: 20, backgroundColor: msg.role === 'ai' ? (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9') : '#ec4899', borderBottomLeftRadius: msg.role === 'ai' ? 4 : 20, borderBottomRightRadius: msg.role === 'user' ? 4 : 20 }}>
                   <Text style={{ fontSize: 14, lineHeight: 22, color: msg.role === 'ai' ? colors.text : '#fff' }}>{msg.val}</Text>
                </View>
              ))}
           </ScrollView>

           {/* Input Terminal */}
           <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
             <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: 20, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', paddingRight: 6 }}>
                  <TextInput
                     value={chatInput}
                     onChangeText={setChatInput}
                     placeholder="Hỏi HR Copilot..."
                     placeholderTextColor={colors.textTertiary}
                     style={{ flex: 1, minHeight: 48, paddingHorizontal: 16, fontSize: 14, color: colors.text, outlineStyle: 'none' } as any}
                     onSubmitEditing={() => {
                       if(chatInput.trim()){
                         setChatMessages([...chatMessages, { role: 'user', val: chatInput }]);
                         setChatInput('');
                         setTimeout(() => {
                           setChatMessages(prev => [...prev, { role: 'ai', val: `S-Group ERP AI đang xử lý yêu cầu: "${chatInput}". Tuy nhiên vì đây là bản demo giao diện (Phase 2), AI backend sẽ được tích hợp sau.` }]);
                         }, 1000);
                       }
                     }}
                  />
                  <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 14, backgroundColor: '#ec4899', alignItems: 'center', justifyContent: 'center' }}>
                     <Send size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
             </View>
           </KeyboardAvoidingView>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.delay(1000).duration(800)} style={{ position: 'absolute', right: 24, bottom: 24, zIndex: 10000 }}>
           <TouchableOpacity onPress={() => setCopilotOpen(true)} style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', shadowColor: '#ec4899', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 12 }}>
             <LinearGradient colors={['#ec4899', '#8b5cf6']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={{ width: '100%', height: '100%', borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={28} color="#fff" />
             </LinearGradient>
           </TouchableOpacity>
        </Animated.View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, flexDirection: 'row', height: Platform.OS === 'web' ? '100vh' as any : '100%' },
  mainArea: { flex: 1, position: 'relative', zIndex: 1 },
  aurora: { position: 'absolute', pointerEvents: 'none', borderRadius: 999 },
  topBarWrapper: {
    zIndex: 100,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {}),
  } as any,
  breadcrumbDot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 8 },
  content: { flex: 1, zIndex: 1 },
  scrollContent: { paddingBottom: 40 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
});
