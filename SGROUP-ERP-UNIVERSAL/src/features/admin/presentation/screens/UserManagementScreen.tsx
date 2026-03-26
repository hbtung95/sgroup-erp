import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Shield, Power } from 'lucide-react-native';
import { useGetAllUsers, useToggleUserStatus } from '../../application/hooks/useAdminQueries';

export const UserManagementScreen = () => {
  const { data: users } = useGetAllUsers();
  const toggleStatus = useToggleUserStatus();

  return (
    <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.container}>
       <BlurView intensity={30} tint="dark" style={styles.header}>
        <Text variant="h1" color="#F8FAFC" weight="bold">Identity Matrix</Text>
        <Text variant="body2" color="#94A3B8">Global Account Registry</Text>
      </BlurView>

      <ScrollView contentContainerStyle={styles.list}>
        {users?.map((u: any) => (
          <BlurView intensity={50} tint="dark" style={[styles.card, { borderColor: u.isActive ? 'rgba(52, 211, 153, 0.2)' : 'rgba(239, 68, 68, 0.2)' }]} key={u.id}>
             <View style={styles.row}>
               <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                 <View style={[styles.iconBox, { backgroundColor: u.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                    <User size={20} color={u.isActive ? '#34D399' : '#F87171'} />
                 </View>
                 <View>
                   <Text variant="h3" weight="bold" color="#F8FAFC">{u.firstName} {u.lastName}</Text>
                   <Text variant="caption" color="#94A3B8">{u.email}</Text>
                 </View>
               </View>

               <TouchableOpacity 
                  onPress={() => toggleStatus.mutate({ id: u.id, isActive: !u.isActive })}
                  style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 }}>
                  <Power size={18} color={u.isActive ? '#10B981' : '#64748B'} />
               </TouchableOpacity>
             </View>

             <View style={styles.metricsRow}>
               <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                 <Shield size={14} color="#6366F1" />
                 <Text variant="caption" color="#818CF8" weight="bold">{u.role.toUpperCase()}</Text>
               </View>
               <Text variant="caption" color="#64748B">
                 Last Login: {new Date(u.lastLogin).toLocaleDateString()}
               </Text>
             </View>
          </BlurView>
        ))}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 20 },
  list: { padding: 16, gap: 12 },
  card: { padding: 20, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.6)', borderWidth: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  iconBox: { padding: 12, borderRadius: 16 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }
});
