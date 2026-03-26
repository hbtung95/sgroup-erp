import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity , Text } from 'react-native';
import { useTheme } from '../../../shared/theme/theme';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { LayoutDashboard, Users, Calculator } from 'lucide-react-native';
import { SGTopBar } from '../../../shared/ui';

import { AgencyDashboard } from './AgencyDashboard';
import { AgencyNetworkScreen } from './AgencyNetworkScreen';
import { AgencyCommissionScreen } from './AgencyCommissionScreen';

export const AgencyScreen = () => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'NETWORK' | 'COMMISSION'>('DASHBOARD');
  const colors = useTheme();
  const { isDark } = useThemeStore();

  const TABS = [
    { key: 'DASHBOARD', label: 'B2B Radar', icon: <LayoutDashboard size={20} color={activeTab === 'DASHBOARD' ? colors.brand : colors.textSecondary} /> },
    { key: 'NETWORK', label: 'Agency Roster', icon: <Users size={20} color={activeTab === 'NETWORK' ? colors.brand : colors.textSecondary} /> },
    { key: 'COMMISSION', label: 'Rebates & Ledger', icon: <Calculator size={20} color={activeTab === 'COMMISSION' ? colors.brand : colors.textSecondary} /> }
  ] as const;

  return (
    <LinearGradient colors={isDark ? ['#020617', '#0F172A'] : ['#F8FAFC', '#E2E8F0']} style={styles.container}>
      <SGTopBar title="Mạng lưới Đại lý B2B" userName="Admin" userRole="CEO" />
      
      <View style={styles.tabContainer}>
        {TABS.map(tab => (
           <TouchableOpacity 
             key={tab.key} 
             style={[styles.tabBtn, activeTab === tab.key && { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.05)', borderBottomWidth: 2, borderBottomColor: colors.brand }]}
             onPress={() => setActiveTab(tab.key)}
           >
             {tab.icon}
             <Text variant="body2" color={activeTab === tab.key ? colors.brand : colors.textSecondary} weight={activeTab === tab.key ? 'bold' : 'normal'}>
               {tab.label}
             </Text>
           </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1, padding: 16 }}>
         {activeTab === 'DASHBOARD' && <AgencyDashboard />}
         {activeTab === 'NETWORK' && <AgencyNetworkScreen />}
         {activeTab === 'COMMISSION' && <AgencyCommissionScreen />}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(148, 163, 184, 0.2)' },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 20 }
});
