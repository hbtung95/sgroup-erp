/**
 * SGROUP ERP — Workspace Portal Screen v3 ("Wow" Edition)
 * Ultra-premium, cinematic enterprise portal with advanced glassmorphism, 
 * dynamic mesh-gradient auroras, and high-fidelity interaction design.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
  Animated,
  Dimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, sgds, typography, spacing, radius, palette } from '@sgroup/ui/src/theme/theme';
import { useAuthStore } from '../../auth/store/authStore';
import { ERP_MODULES, ErpModuleDefinition } from '../../../core/config/modules';
import { useNavigation } from '@react-navigation/native';
import { SGThemeToggle } from '@sgroup/ui/src/ui/components/SGThemeToggle';
import { useThemeStore } from '@sgroup/ui/src/theme/themeStore';
import {
  BarChart3,
  ShoppingCart,
  Megaphone,
  Users,
  Home,
  Building,
  UserCog,
  DollarSign,
  FileText,
  LogOut,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Activity,
} from 'lucide-react-native';

const MODULE_ICONS: Record<string, any> = {
  exec: BarChart3,
  biz: ShoppingCart,
  mkt: Megaphone,
  agency: Users,
  shomes: Home,
  project: Building,
  hr: UserCog,
  finance: DollarSign,
  legal: FileText,
};

const isWeb = Platform.OS === 'web';
const css = (s: any) => (isWeb ? s : {});
const INTER = isWeb ? { fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" } : {};

export function WorkspaceScreen() {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigation = useNavigation();
  const [winWidth, setWinWidth] = useState(Dimensions.get('window').width);

  // Animations
  const fade = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;
  
  // Ambient Aura Animations
  const aurora1 = useRef(new Animated.Value(0)).current;
  const aurora2 = useRef(new Animated.Value(0)).current;
  const aurora3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(slideY, { toValue: 0, friction: 9, tension: 35, useNativeDriver: true }),
    ]).start();

    const loop = (anim: Animated.Value, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 0, duration, useNativeDriver: false }),
        ])
      ).start();
    };

    loop(aurora1, 18000);
    loop(aurora2, 25000);
    loop(aurora3, 22000);

    const sub = Dimensions.addEventListener('change', () => setWinWidth(Dimensions.get('window').width));
    return () => sub?.remove?.();
  }, []);

  const accessibleModules = ERP_MODULES.filter((m) => {
    // Explicitly hide project module from any user who has a sales role assigned
    if (m.id === 'project' && !!user?.salesRole) {
      return false;
    }
    
    // Fallback normal logic
    return user?.role === 'admin' || user?.modules?.includes(m.id);
  });

  const handleModulePress = (mod: ErpModuleDefinition) => {
    if (mod.routeName) {
      navigation.navigate(mod.routeName as any);
    }
  };

  // Dynamic Background Styles
  const auroraStyle1 = {
    top: aurora1.interpolate({ inputRange: [0, 1], outputRange: ['-10%', '20%'] }),
    left: aurora1.interpolate({ inputRange: [0, 1], outputRange: ['-5%', '30%'] }),
    opacity: isDark ? 0.15 : 0.08,
  };

  const auroraStyle2 = {
    bottom: aurora2.interpolate({ inputRange: [0, 1], outputRange: ['-15%', '25%'] }),
    right: aurora2.interpolate({ inputRange: [0, 1], outputRange: ['-10%', '40%'] }),
    opacity: isDark ? 0.12 : 0.06,
  };

  const auroraStyle3 = {
    top: aurora3.interpolate({ inputRange: [0, 1], outputRange: ['40%', '10%'] }),
    right: aurora3.interpolate({ inputRange: [0, 1], outputRange: ['10%', '50%'] }),
    opacity: isDark ? 0.1 : 0.05,
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#05070A' : '#F8FAFC' }]}>
      
      {/* ── CINEMATIC BACKDROP ── */}
      {isWeb && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Main Gradients */}
          <LinearGradient
            colors={isDark ? ['#05070A', '#0D0F14'] : ['#F8FAFC', '#F1F5F9']}
            style={StyleSheet.absoluteFill}
          />
          
          {/* Animated Mesh Auroras */}
          <Animated.View style={[styles.aurora, auroraStyle1, { width: 800, height: 800, backgroundColor: '#D42027', filter: 'blur(120px)' } as any]} />
          <Animated.View style={[styles.aurora, auroraStyle2, { width: 700, height: 700, backgroundColor: '#3B82F6', filter: 'blur(140px)' } as any]} />
          <Animated.View style={[styles.aurora, auroraStyle3, { width: 600, height: 600, backgroundColor: isDark ? '#FACC15' : '#8B5CF6', filter: 'blur(100px)' } as any]} />
          
          {/* Subtle Grid Pattern Overlay */}
          <View style={[styles.gridOverlay, { opacity: isDark ? 0.03 : 0.02 }]} />
        </View>
      )}

      {/* ── ULTRA-MINIMAL TOPBAR ── */}
      <View style={styles.topBarContainer}>
        <View style={[
          styles.topBar, 
          { backgroundColor: isDark ? 'rgba(15,20,30,0.4)' : 'rgba(255,255,255,0.7)', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
          css(sgds.glass)
        ] as any}>
          <View style={styles.topBarLeft}>
            <View style={[styles.logoPlate, css({ boxShadow: isDark ? '0 8px 32px rgba(212,32,39,0.2)' : '0 4px 16px rgba(0,0,0,0.08)' })]}>
              <Image source={require('../../../../assets/images/Logo 3_noFont.png')} style={styles.logoImg} resizeMode="contain" />
            </View>
            <View style={styles.brandTextWrap}>
              <Text style={[styles.brandMain, { color: isDark ? '#FFF' : '#0F172A' }]}>SGROUP</Text>
              <Text style={[styles.brandSub, { color: colors.textTertiary }]}>ENTERPRISE PORTAL</Text>
            </View>
          </View>

          <View style={styles.topBarRight}>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: isDark ? '#FFF' : '#0F172A' }]}>{user?.name || 'Nguyễn Admin'}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.onlineDot} />
                <Text style={[styles.userRole, { color: colors.textSecondary }]}>Hệ thống vận hành</Text>
              </View>
            </View>
            
            <View style={[styles.dividerBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
            
            <SGThemeToggle size="sm" />
            
            <TouchableOpacity onPress={logout} style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }, css(sgds.cursor)]}>
              <LogOut size={18} color={isDark ? '#FFF' : '#334155'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── MAIN CONTENT ── */}
      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fade, transform: [{ translateY: slideY }], width: '100%', alignItems: 'center' }}>
          
          {/* Hero Welcome */}
          <View style={styles.heroSection}>
            <View style={[styles.heroBadge, { backgroundColor: isDark ? 'rgba(212,32,39,0.15)' : 'rgba(212,32,39,0.08)' }]}>
              <Sparkles size={14} color="#D42027" />
              <Text style={styles.heroBadgeText}>NỀN TẢNG QUẢN TRỊ TOÀN DIỆN</Text>
            </View>
            
            <Text style={[styles.heroTitle, { color: isDark ? '#FFF' : '#0F172A' }]}>Chào mừng trở lại, {user?.name?.split(' ').pop() || 'Admin'}</Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Khám phá hệ sinh thái 9 phân hệ thông minh, sẵn sàng tối ưu hóa mọi luồng công việc của bạn hôm nay.
            </Text>

            {/* Stats Pills */}
            <View style={styles.statsRow}>
              <MetricPill icon={ShieldCheck} label="Bảo mật cấp cao" color="#10B981" isDark={isDark} />
              <MetricPill icon={Activity} label="Thời gian thực" color="#3B82F6" isDark={isDark} />
              <MetricPill icon={Sparkles} label="9+ Modules" color="#D42027" isDark={isDark} />
            </View>
          </View>

          {/* Module Grid */}
          <View style={styles.moduleGrid}>
            {accessibleModules.map((mod, i) => (
              <ModulePortalCard 
                key={mod.id} 
                mod={mod} 
                index={i}
                colors={colors} 
                isDark={isDark} 
                onPress={() => handleModulePress(mod)} 
              />
            ))}
          </View>

          <View style={styles.footerWrap}>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              © 2026 SGROUP SYSTEM. PHÁT TRIỂN BỞI CÔNG TY TNHH BẤT ĐỘNG SẢN SGROUP
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function MetricPill({ icon: Icon, label, color, isDark }: any) {
  return (
    <View style={[styles.metricPill, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
      <Icon size={14} color={color} />
      <Text style={[styles.metricLabel, { color: isDark ? '#FFF' : '#475569' }]}>{label}</Text>
    </View>
  );
}

function ModulePortalCard({ mod, index, colors, isDark, onPress }: any) {
  const [hover, setHover] = useState(false);
  const Icon = MODULE_ICONS[mod.id] || BarChart3;
  const isLocked = !mod.routeName;

  return (
    <Pressable
      onPress={onPress}
      disabled={isLocked}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={({ pressed }) => [
        styles.cardContainer,
        {
          backgroundColor: isDark 
            ? (hover ? 'rgba(212,32,39,0.08)' : 'rgba(255,255,255,0.02)') 
            : (hover ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.6)'),
          borderColor: hover 
            ? (isDark ? 'rgba(212,32,39,0.4)' : 'rgba(212,32,39,0.2)') 
            : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
        },
        isWeb && {
          transform: hover ? [{ translateY: -10 }, { scale: 1.03 }] : [{ translateY: 0 }, { scale: 1 }],
          boxShadow: hover 
            ? (isDark ? '0 30px 60px rgba(0,0,0,0.6), 0 0 30px rgba(212,32,39,0.15)' : '0 20px 40px rgba(0,0,0,0.08)')
            : '0 4px 12px rgba(0,0,0,0.02)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          cursor: isLocked ? 'default' : 'pointer',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        } as any,
        pressed && !isWeb && { opacity: 0.8 },
      ]}
    >
      <View style={styles.cardGlowBorder} />
      
      <LinearGradient
        colors={hover ? ['#D42027', '#9F1219'] : (isDark ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)'] : colors.gradientBrand)}
        style={styles.cardIconBox}
      >
        <Icon size={26} color={isDark && !hover ? '#D42027' : '#FFF'} />
      </LinearGradient>

      <Text style={[styles.cardTitle, { color: isDark ? '#FFF' : '#0F172A' }]}>{mod.name}</Text>
      <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
        {mod.description}
      </Text>

      <View style={styles.cardActionRow}>
        <View style={[styles.arrowCircle, { backgroundColor: hover ? '#D42027' : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') }]}>
          <ChevronRight size={14} color={hover ? '#FFF' : colors.textTertiary} />
        </View>
      </View>

      {isLocked && (
        <View style={styles.lockedLabel}>
          <Text style={styles.lockedLabelText}>COMING SOON</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  aurora: { position: 'absolute', pointerEvents: 'none', borderRadius: 999 } as any,
  gridOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  } as any,

  /* TopBar */
  topBarContainer: {
    paddingHorizontal: 32,
    paddingTop: 20,
    zIndex: 1000,
    position: 'absolute', top: 0, left: 0, right: 0,
  },
  topBar: {
    height: 76,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoPlate: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center',
  },
  logoImg: { width: 34, height: 34 },
  brandTextWrap: { gap: 1 },
  brandMain: { fontSize: 18, fontWeight: '900', letterSpacing: 1.5, ...INTER } as any,
  brandSub: { fontSize: 9, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', opacity: 0.8 },

  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  userInfo: { alignItems: 'flex-end' },
  userName: { fontSize: 14, fontWeight: '700', ...INTER } as any,
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  userRole: { fontSize: 11, fontWeight: '500' },
  dividerBar: { width: 1, height: 28 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  /* Content */
  scrollArea: { paddingHorizontal: 32, paddingTop: 140, paddingBottom: 64, alignItems: 'center' },
  heroSection: { alignItems: 'center', marginBottom: 64, maxWidth: 800 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100,
    marginBottom: 24,
  },
  heroBadgeText: { fontSize: 11, fontWeight: '800', color: '#D42027', letterSpacing: 1 },
  heroTitle: { fontSize: 44, fontWeight: '900', letterSpacing: -1, textAlign: 'center', ...INTER } as any,
  heroSubtitle: { fontSize: 18, fontWeight: '500', textAlign: 'center', marginTop: 16, lineHeight: 28, maxWidth: 640 },
  
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 32 },
  metricPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16,
    borderWidth: 1,
  },
  metricLabel: { fontSize: 13, fontWeight: '600' },

  /* Grid */
  moduleGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 24,
    width: '100%', maxWidth: 1240,
  },
  cardContainer: {
    width: 280,
    minHeight: 220,
    borderRadius: 32,
    borderWidth: 1,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlowBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, 
    height: 1, backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cardIconBox: {
    width: 56, height: 56, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8, ...INTER } as any,
  cardDesc: { fontSize: 14, fontWeight: '400', lineHeight: 20, opacity: 0.8 },
  cardActionRow: { marginTop: 20, alignItems: 'flex-end' },
  arrowCircle: {
    width: 34, height: 34, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  lockedLabel: {
    position: 'absolute', top: 24, right: 24,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, backgroundColor: 'rgba(245,158,11,0.1)',
  },
  lockedLabelText: { fontSize: 9, fontWeight: '800', color: '#F59E0B' },

  footerWrap: { marginTop: 80, paddingVertical: 40, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', width: '100%' },
  footerText: { textAlign: 'center', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
});
