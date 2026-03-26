import React from 'react';
import { View, ScrollView, StyleSheet } , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Building, Users, FileText, CheckSquare } from 'lucide-react-native';
import { useGetProjects } from '../../application/hooks/useProjectQueries';

import { SGCard } from '../../../../shared/ui/SGCard';

export const ProjectDashboard = () => {
  const { data: projects, isLoading } = useGetProjects();

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.hero}>
        <Text variant="h1" color="#FFF">Project Control Center</Text>
        <Text variant="body1" color="#94A3B8">Managing {isLoading ? '...' : projects?.length || 0} active projects</Text>
      </LinearGradient>

      <View style={styles.content}>
        <SGCard style={styles.quickAccess}>
           <Text variant="h3" weight="bold" style={{ marginBottom: 16 }}>Quick Access</Text>
           <View style={styles.menuGrid}>
             {[
               { icon: Building, label: 'Inventory (Bảng hàng)', color: '#10B981' },
               { icon: FileText, label: 'Docs & Legal', color: '#3B82F6' },
               { icon: CheckSquare, label: 'Policies', color: '#8B5CF6' },
               { icon: Users, label: 'Assignments', color: '#F59E0B' },
             ].map((item, i) => (
               <BlurView key={i} intensity={80} style={styles.menuItem}>
                 <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                   <item.icon size={24} color={item.color} />
                 </View>
                 <Text variant="body2" weight="bold" style={{ textAlign: 'center' }}>{item.label}</Text>
               </BlurView>
             ))}
           </View>
        </SGCard>

        <Text variant="h3" weight="bold" style={{ marginVertical: 16, marginLeft: 4 }}>Recent Projects</Text>
        {projects?.slice(0, 5).map((p: any) => (
          <SGCard key={p.id} style={styles.projectCard}>
            <View style={styles.projectHeader}>
              <Text variant="h3">{p.name}</Text>
              <View style={styles.badge}><Text variant="caption" color="#10B981">{p.status}</Text></View>
            </View>
            <Text variant="body2" color="#64748B">{p.location || 'No location set'}</Text>
          </SGCard>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  hero: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  content: { padding: 16, marginTop: -20 },
  quickAccess: { padding: 20 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  menuItem: {
    width: '48%', padding: 16, borderRadius: 16, alignItems: 'center', gaps: 8,
    backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#FFF'
  },
  iconBox: { padding: 12, borderRadius: 12, marginBottom: 8 },
  projectCard: { marginBottom: 12, padding: 16 },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#ECFDF5', borderRadius: 12 },
});
