import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, sgds, typography, spacing, radius } from '@sgroup/ui/src/theme/theme';
import { useThemeStore } from '@sgroup/ui/src/theme/themeStore';
import { useAuthStore } from '../auth/store/authStore';
import { useNavigation } from '@react-navigation/native';
import {
  BarChart3,
  TrendingUp,
  Megaphone,
  Users,
  Building,
  Building2,
  ShoppingCart,
  Settings,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Home,
  LayoutDashboard,
  Target,
  PieChart,
  UserCog,
  Briefcase,
  Cog,
  Calculator,
} from 'lucide-react-native';
import { SGThemeToggle } from '@sgroup/ui/src/ui/components/SGThemeToggle';

export interface SidebarItem {
  key: string;
  label: string;
  icon: any;
  section: 'overview' | 'planning';
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { key: 'OVERVIEW_DASHBOARD', label: 'Tổng quan', icon: LayoutDashboard, section: 'overview' },
  { key: 'OVERVIEW_SALES', label: 'Kinh doanh', icon: ShoppingCart, section: 'overview' },
  { key: 'OVERVIEW_MARKETING', label: 'Tiếp thị', icon: Megaphone, section: 'overview' },
  { key: 'OVERVIEW_HR', label: 'Nhân sự', icon: Users, section: 'overview' },
  { key: 'OVERVIEW_AGENCY', label: 'Đại lý', icon: Briefcase, section: 'overview' },
  { key: 'OVERVIEW_SHOMES', label: 'S-Homes', icon: Building2, section: 'overview' },
  { key: 'OVERVIEW_PROJECT', label: 'Dự án', icon: Building, section: 'overview' },
  { key: 'OVERVIEW_OPS', label: 'Vận hành', icon: Cog, section: 'overview' },
  { key: 'OVERVIEW_FINANCE', label: 'Tài chính', icon: DollarSign, section: 'overview' },
  { key: 'PLAN_TOTAL', label: 'Kế hoạch tổng', icon: Target, section: 'planning' },
  { key: 'PLAN_SALES', label: 'Kế hoạch Kinh doanh', icon: TrendingUp, section: 'planning' },
  { key: 'PLAN_MARKETING', label: 'Kế hoạch Tiếp thị', icon: PieChart, section: 'planning' },
  { key: 'PLAN_HR', label: 'Kế hoạch Nhân sự', icon: UserCog, section: 'planning' },
  { key: 'PLAN_AGENCY', label: 'Kế hoạch Đại lý', icon: Briefcase, section: 'planning' },
  { key: 'PLAN_SHOMES', label: 'Kế hoạch S-Homes', icon: Building2, section: 'planning' },
  { key: 'PLAN_PROJECT', label: 'Kế hoạch Dự án', icon: Building, section: 'planning' },
  { key: 'PLAN_OPS', label: 'Kế hoạch Vận hành', icon: Settings, section: 'planning' },
  { key: 'PLAN_FINANCE', label: 'Kế hoạch Tài chính', icon: Calculator, section: 'planning' },
];

interface Props {
  activeKey: string;
  onSelect: (item: SidebarItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function BDHSidebar({ activeKey, onSelect, collapsed, onToggleCollapse }: Props) {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { logout } = useAuthStore();
  const navigation = useNavigation();

  const overviewItems = SIDEBAR_ITEMS.filter((i) => i.section === 'overview');
  const planningItems = SIDEBAR_ITEMS.filter((i) => i.section === 'planning');

  const renderItem = (item: SidebarItem) => {
    const isActive = activeKey === item.key;
    const IconComp = item.icon;
    return (
      <TouchableOpacity
        key={item.key}
        onPress={() => onSelect(item)}
        style={[
          styles.menuItem,
          {
            backgroundColor: isActive
              ? (isDark ? 'rgba(212,32,39,0.15)' : 'rgba(212,32,39,0.08)')
              : 'transparent',
            borderRadius: 12,
            marginHorizontal: 10,
            marginBottom: 3,
            borderLeftWidth: isActive ? 3 : 3,
            borderLeftColor: isActive ? '#D42027' : 'transparent',
            ...sgds.transition.fast,
            ...sgds.cursor,
          } as any,
        ]}
      >
        <View style={[styles.iconBox, {
          backgroundColor: isActive ? '#D42027' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
        }]}>
          <IconComp size={18} color={isActive ? '#FFF' : (isDark ? '#CBD5E1' : '#475569')} strokeWidth={isActive ? 2.5 : 2} />
        </View>
        {!collapsed && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: isActive ? '800' : '700',
              fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
              color: isActive ? (isDark ? '#FFFFFF' : '#0F172A') : (isDark ? '#E2E8F0' : '#334155'),
              marginLeft: 12,
              flex: 1,
              letterSpacing: isActive ? 0.2 : 0,
            }}
            numberOfLines={1}
          >
            {item.label}
          </Text>
        )}
        {isActive && !collapsed && (
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#D42027', marginRight: 4 }} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.sidebar,
        {
          width: collapsed ? 80 : 260,
          backgroundColor: isDark ? 'rgba(15,20,32,0.8)' : 'rgba(255,255,255,0.9)',
          borderRightColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
          ...sgds.glass,
        } as any,
      ]}
    >
      <View style={styles.header}>
        {!collapsed && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('Workspace' as any)} 
            style={[styles.logoBox, css(sgds.cursor)]}
          >
            <View style={styles.logoCircle}>
               <Image source={require('../../../assets/images/Logo 3_noFont.png')} style={styles.logoImg} resizeMode="contain" />
            </View>
            <View>
              <Text style={[typography.smallBold, { color: colors.text, letterSpacing: 1 }]}>SGROUP</Text>
              <Text style={[typography.caption, { color: colors.textTertiary, fontSize: 9, fontWeight: '700' }]}>CỔNG ĐIỀU HÀNH</Text>
            </View>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          onPress={onToggleCollapse} 
          style={[styles.collapseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }, css(sgds.cursor)]}
        >
          {collapsed ? <ChevronRight size={16} color={colors.textSecondary} /> : <ChevronLeft size={16} color={colors.textSecondary} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12 }}>
        {!collapsed && (
          <Text style={{
            fontSize: 11,
            fontWeight: '800',
            fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: isDark ? '#94A3B8' : '#64748B',
            paddingHorizontal: 24,
            marginTop: 16,
            marginBottom: 10,
          }}>
            TỔNG QUAN & GIÁM SÁT
          </Text>
        )}
        {overviewItems.map(renderItem)}
        
        <View style={[styles.sectionDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />

        {!collapsed && (
          <Text style={{
            fontSize: 11,
            fontWeight: '800',
            fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', system-ui, sans-serif",
            letterSpacing: 1.8,
            textTransform: 'uppercase',
            color: isDark ? '#94A3B8' : '#64748B',
            paddingHorizontal: 24,
            marginTop: 16,
            marginBottom: 10,
          }}>
            KẾ HOẠCH CHIẾN LƯỢC
          </Text>
        )}
        {planningItems.map(renderItem)}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
        <SGThemeToggle size="sm" />
        <TouchableOpacity onPress={logout} style={[styles.footerBtn, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)' }, sgds.cursor]}>
          <LogOut size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const isWeb = Platform.OS === 'web';
const css = (s: any) => (isWeb ? s : {});

const styles = StyleSheet.create({
  sidebar: { borderRightWidth: 1, height: '100%' },
  header: { 
    height: 80, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.02)',
  },
  logoBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoCircle: { 
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF', 
    justifyContent: 'center', alignItems: 'center',
    ...(isWeb ? { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } : {}),
  } as any,
  logoImg: { width: 24, height: 24 },
  collapseBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  
  scrollArea: { flex: 1 },
  sectionDivider: { height: 1, marginHorizontal: 24, marginVertical: 12 },
  
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10, 
    paddingHorizontal: 8,
  },
  iconBox: {
    width: 32, height: 32, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
  },
  
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 16, 
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  footerBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
});
