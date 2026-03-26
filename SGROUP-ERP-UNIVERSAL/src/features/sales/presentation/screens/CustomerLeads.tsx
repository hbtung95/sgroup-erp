import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, Phone, Mail } from 'lucide-react-native';
import { useGetCustomers } from '../../application/hooks/useSalesQueries';
import { SGCard } from '../../../../shared/ui/SGCard';

export const CustomerLeads = () => {
  const [filter, setFilter] = useState('ALL');
  const { data: leads, isLoading } = useGetCustomers(filter !== 'ALL' ? { status: filter } : undefined);

  return (
    <LinearGradient colors={['#EFF6FF', '#DBEAFE']} style={styles.container}>
      <BlurView intensity={50} tint="light" style={styles.header}>
        <Text variant="h1" weight="bold" color="#1E3A8A">Leads & Pipelines</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
           {['ALL', 'NEW', 'CONTACTED', 'MEETING', 'NEGOTIATION'].map(f => (
             <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, filter === f && styles.filterActive]}>
               <Text variant="caption" color={filter === f ? '#FFF' : '#1D4ED8'} weight="bold">{f}</Text>
             </TouchableOpacity>
           ))}
        </ScrollView>
      </BlurView>

      <ScrollView contentContainerStyle={styles.list}>
        {isLoading ? <ActivityIndicator size="large" color="#2563EB" style={{marginTop: 40}} /> : (
          leads?.map((lead: any) => (
             <BlurView intensity={90} tint="light" style={styles.leadCard} key={lead.id}>
               <View style={styles.leadHeader}>
                 <Text variant="h3" weight="bold">{lead.fullName}</Text>
                 <View style={styles.badge}><Text variant="caption" color="#047857">{lead.status}</Text></View>
               </View>
               <View style={styles.contactRow}>
                 <Phone size={16} color="#64748B" />
                 <Text variant="body2" color="#475569">{lead.phone || 'No phone'}</Text>
               </View>
               <View style={styles.contactRow}>
                 <Mail size={16} color="#64748B" />
                 <Text variant="body2" color="#475569">{lead.email || 'No email'}</Text>
               </View>
             </BlurView>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24 },
  filterScroll: { flexDirection: 'row', marginTop: 16 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(37, 99, 235, 0.1)', marginRight: 8 },
  filterActive: { backgroundColor: '#2563EB' },
  list: { padding: 16, gap: 12 },
  leadCard: { padding: 20, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: '#FFF' },
  leadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#D1FAE5', borderRadius: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }
});
