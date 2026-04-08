import React from 'react';
import { View, ScrollView, StyleSheet , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { KeyRound, Lock, Unlock } from 'lucide-react-native';
import { useGetPermissionsMatrix } from '../../application/hooks/useAdminQueries';

export const RolePermissionScreen = () => {
  const { data: matrix } = useGetPermissionsMatrix();

  const getPermissionColor = (perm: string) => {
    switch (perm) {
      case 'full': return '#10B981';
      case 'write': return '#F59E0B';
      case 'read': return '#60A5FA';
      default: return '#EF4444'; // none
    }
  };

  return (
    <LinearGradient colors={['#020617', '#0F172A']} style={styles.container}>
       <BlurView intensity={20} tint="dark" style={styles.header}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <KeyRound color="#A78BFA" size={24} />
          <View>
            <Text variant="h1" color="#F8FAFC" weight="bold">Global RBAC Matrix</Text>
            <Text variant="body2" color="#A78BFA">Zero-Trust Architecture Core</Text>
          </View>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.content}>
        {matrix && Object.entries(matrix).map(([role, modules]: [string, any]) => (
          <View key={role} style={styles.roleBlock}>
            <View style={styles.roleHeader}>
               <Text variant="h3" color="#F8FAFC" style={{fontFamily: 'monospace'}}>// ROLE: {role.toUpperCase()}</Text>
            </View>
            
            <View style={styles.grid}>
               {Object.entries(modules).map(([mod, perm]: [string, any]) => (
                 <BlurView key={mod} intensity={40} tint="dark" style={[styles.moduleBox, { borderColor: getPermissionColor(perm) + '40' }]}>
                   <Text variant="caption" color="#94A3B8">{mod.toUpperCase()}</Text>
                   <View style={{flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8}}>
                     {perm === 'none' ? <Lock size={12} color="#EF4444" /> : <Unlock size={12} color={getPermissionColor(perm)} />}
                     <Text variant="body2" color={getPermissionColor(perm)} weight="bold">{perm}</Text>
                   </View>
                 </BlurView>
               ))}
            </View>
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
  roleBlock: { marginBottom: 32 },
  roleHeader: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(167, 139, 250, 0.1)', borderLeftWidth: 4, borderLeftColor: '#A78BFA', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moduleBox: { width: '47%', padding: 16, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(0,0,0,0.6)' }
});
