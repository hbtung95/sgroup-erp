import React from 'react';
import { View, ScrollView, StyleSheet, Switch , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ToggleRight, AlertTriangle } from 'lucide-react-native';
import { useGetFeatureFlags, useToggleFeatureFlag } from '../../application/hooks/useAdminQueries';

export const FeatureFlagsScreen = () => {
  const { data: flags } = useGetFeatureFlags();
  const toggleFlag = useToggleFeatureFlag();

  return (
    <LinearGradient colors={['#312E81', '#1E1B4B']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <ToggleRight color="#818CF8" size={28} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">Feature Gates</Text>
            <Text variant="body2" color="#818CF8">Module Lifecycle Switches</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        {flags?.map((f: any) => (
          <BlurView intensity={40} tint="dark" style={[styles.card, { borderColor: f.enabled ? 'rgba(129, 140, 248, 0.4)' : 'rgba(255, 255, 255, 0.05)' }]} key={f.id}>
             <View style={styles.row}>
               <View style={{flex: 1, paddingRight: 16}}>
                 <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4}}>
                   {!f.enabled && <AlertTriangle size={14} color="#F87171" />}
                   <Text variant="h3" color={f.enabled ? '#F8FAFC' : '#94A3B8'} weight="bold">{f.key}</Text>
                 </View>
                 <Text variant="caption" color="#94A3B8">{f.description || 'System flag'}</Text>
               </View>

               <Switch
                 value={f.enabled}
                 onValueChange={(val) => toggleFlag.mutate({ key: f.key, enabled: val, updatedBy: 'ADMIN' })}
                 trackColor={{ false: '#334155', true: '#818CF8' }}
                 thumbColor={f.enabled ? '#F8FAFC' : '#94A3B8'}
               />
             </View>
             
             <View style={styles.footerRow}>
                <Text variant="caption" color="#64748B" style={{fontFamily: 'monospace'}}>Module: {f.module || 'GLOBAL'}</Text>
                <Text variant="caption" color="#64748B" style={{fontFamily: 'monospace'}}>Updated: {new Date(f.updatedAt).toLocaleDateString()}</Text>
             </View>
          </BlurView>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(129, 140, 248, 0.2)' },
  content: { padding: 16, gap: 12 },
  card: { padding: 20, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }
});
