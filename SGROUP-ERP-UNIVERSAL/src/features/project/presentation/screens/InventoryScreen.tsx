import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator , Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, Home, Lock, Unlock } from 'lucide-react-native';
import { useGetInventory, useLockProduct } from '../../application/hooks/useProjectQueries';

import { SGCard } from '../../../../shared/ui/components/SGCard';

export const InventoryScreen = ({ route }: any) => {
  const projectId = route?.params?.projectId || 'sample-project-id';
  const [filter, setFilter] = useState('ALL');
  
  const { data: products, isLoading } = useGetInventory(projectId, filter !== 'ALL' ? { status: filter } : undefined);
  const { mutateAsync: lockProduct } = useLockProduct();

  const handleLock = async (productId: string) => {
    await lockProduct({ projectId, productId, staffName: 'Current User' });
  };

  return (
    <LinearGradient colors={['#F0FDF4', '#DCFCE7']} style={styles.container}>
      <View style={styles.header}>
        <BlurView intensity={60} tint="light" style={styles.headerBlur}>
          <Text variant="h1" weight="bold" color="#065F46">Inventory Grid</Text>
          <Text variant="body2" color="#059669">Live Real Estate Availability</Text>
          
          <View style={styles.filterRow}>
            {['ALL', 'AVAILABLE', 'LOCKED', 'SOLD'].map(f => (
              <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, filter === f && styles.filterBtnActive]}>
                <Text variant="caption" color={filter === f ? '#FFF' : '#047857'}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </BlurView>
      </View>

      <ScrollView contentContainerStyle={styles.grid}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#059669" style={{ marginTop: 40 }} />
        ) : (
          products?.map((unit: any) => (
            <BlurView intensity={90} tint="light" style={styles.unitCard} key={unit.id}>
              <View style={styles.unitHeader}>
                <Text variant="h3" weight="bold">{unit.code}</Text>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(unit.status) }]} />
              </View>
              
              <Text variant="body2" color="#64748B">{unit.area} mÂ² â€¢ {unit.bedrooms} BR</Text>
              <Text variant="h2" weight="bold" color="#065F46" style={styles.price}>
                {unit.price} Tá»·
              </Text>

              {unit.status === 'AVAILABLE' ? (
                 <TouchableOpacity style={styles.lockBtn} onPress={() => handleLock(unit.id)}>
                   <Lock size={16} color="#FFF" />
                   <Text color="#FFF" variant="caption">Lock</Text>
                 </TouchableOpacity>
              ) : (
                 <View style={styles.lockedArea}>
                   <Text variant="caption" color="#64748B">Locked by: {unit.bookedBy || 'Unknown'}</Text>
                 </View>
              )}
            </BlurView>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'AVAILABLE': return '#10B981';
    case 'LOCKED': return '#F59E0B';
    case 'SOLD': return '#EF4444';
    default: return '#94A3B8';
  }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 16 },
  headerBlur: { padding: 24, paddingTop: 60, paddingBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(5, 150, 105, 0.1)' },
  filterBtnActive: { backgroundColor: '#059669' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  unitCard: {
    width: '48%', borderRadius: 16, padding: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.8)',
  },
  unitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusDot: { width: 12, height: 12, borderRadius: 6 },
  price: { marginTop: 8, marginBottom: 16 },
  lockBtn: {
    backgroundColor: '#059669', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 8, borderRadius: 8, gap: 4
  },
  lockedArea: { padding: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, alignItems: 'center' }
});
