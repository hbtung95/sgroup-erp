import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Server, Mail, ShieldCheck } from 'lucide-react-native';
import { useGetSettings } from '../../application/hooks/useAdminQueries';

export const SystemSettingsScreen = () => {
  const { data: settings } = useGetSettings();

  const getGroupIcon = (group: string) => {
    switch(group) {
        case 'general': return <Server size={20} color="#60A5FA" />;
        case 'email': return <Mail size={20} color="#FBBF24" />;
        case 'security': return <ShieldCheck size={20} color="#10B981" />;
        default: return <Settings size={20} color="#A78BFA" />;
    }
  };

  return (
    <LinearGradient colors={['#111827', '#1F2937']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <Settings color="#A78BFA" size={28} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">System Configuration</Text>
            <Text variant="body2" color="#A78BFA">Global Key-Value Store</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        {settings?.reduce((groups: any, setting: any) => {
           groups[setting.group] = groups[setting.group] || [];
           groups[setting.group].push(setting);
           return groups;
        }, Object.create(null)) && Object.entries(
            settings?.reduce((a: any, s: any) => { a[s.group] = [...(a[s.group] || []), s]; return a; }, {}) || {}
        ).map(([groupName, groupSettings]: [string, any]) => (
          <View key={groupName} style={styles.groupBlock}>
             <View style={styles.groupHeader}>
               {getGroupIcon(groupName)}
               <Text variant="h2" color="#F8FAFC" weight="bold" style={{textTransform: 'uppercase'}}>{groupName}</Text>
             </View>
             
             {groupSettings.map((s: any) => (
               <BlurView intensity={40} tint="dark" style={styles.settingRow} key={s.id}>
                  <View style={{flex: 1}}>
                    <Text variant="body1" color="#E2E8F0" weight="bold">{s.label || s.key}</Text>
                    <Text variant="caption" color="#94A3B8">{s.description || 'No description provided'}</Text>
                  </View>
                  <View style={styles.valueBox}>
                    <Text variant="body2" color="#F8FAFC" style={{fontFamily: 'monospace'}}>{String(s.value).slice(0, 30)}{String(s.value).length > 30 ? '...' : ''}</Text>
                  </View>
               </BlurView>
             ))}
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(167, 139, 250, 0.2)' },
  content: { padding: 16 },
  groupBlock: { marginBottom: 32 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingLeft: 8 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, marginBottom: 8, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  valueBox: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, maxWidth: '50%' }
});
