import React from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { useGetAllAgencies } from '../application/hooks/useAgencyQueries';
import { Users } from 'lucide-react-native';

export const AgencyNetworkScreen = () => {
  const { data, isLoading } = useGetAllAgencies();

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color="#3B82F6" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BlurView intensity={30} tint="dark" style={styles.listContainer}>
         <View style={styles.tableHeader}>
           <Text variant="body2" color="#94A3B8" weight="bold" style={{flex: 1}}>Agency Code</Text>
           <Text variant="body2" color="#94A3B8" weight="bold" style={{flex: 2}}>Name</Text>
           <Text variant="body2" color="#94A3B8" weight="bold" style={{flex: 1}}>Tier</Text>
           <Text variant="body2" color="#94A3B8" weight="bold" style={{flex: 1}}>Region</Text>
         </View>

         {(!data || data.length === 0) ? (
            <View style={styles.emptyState}>
               <Users size={32} color="#475569" />
               <Text variant="body2" color="#64748B" style={{marginTop: 8}}>No agencies registered yet.</Text>
            </View>
         ) : (
            data.map((ag: any) => (
              <View key={ag.id} style={styles.tableRow}>
                 <Text variant="body2" color="#3B82F6" style={{flex: 1, fontFamily: 'monospace'}}>{ag.code}</Text>
                 <Text variant="body1" color="#F8FAFC" weight="bold" style={{flex: 2}}>{ag.name}</Text>
                 <View style={{flex: 1}}>
                    <View style={[styles.tierBadge, { backgroundColor: ag.tier?.name === 'DIAMOND' ? 'rgba(56,189,248,0.2)' : 'rgba(250,204,21,0.2)' }]}>
                       <Text variant="micro" color={ag.tier?.name === 'DIAMOND' ? '#38BDF8' : '#FACC15'} weight="bold">{ag.tier?.name || 'SILVER'}</Text>
                    </View>
                 </View>
                 <Text variant="body2" color="#94A3B8" style={{flex: 1}}>{ag.region || 'N/A'}</Text>
              </View>
            ))
         )}
      </BlurView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  listContainer: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.5)', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.8)' },
  tableRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  emptyState: { padding: 40, alignItems: 'center' },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' }
});
