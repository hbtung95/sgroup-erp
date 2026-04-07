import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Filter, Lock, ShieldAlert, BadgeCheck } from 'lucide-react-native';
import { useGetInventory, useLockProduct } from '../../application/hooks/useProjectQueries';
import { typography, sgds } from '../../../../shared/theme/theme';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';

export const InventoryScreen = ({ route }: any) => {
  const projectId = route?.params?.projectId || 'sample-project-id';
  const { theme, isDark } = useAppTheme();
  
  const [filter, setFilter] = useState('ALL');
  const { data: products, isLoading } = useGetInventory(projectId, filter !== 'ALL' ? { status: filter } : undefined);
  const { mutateAsync: lockProduct, isPending: isLocking } = useLockProduct();

  const handleLock = async (productId: string) => {
    try {
      await lockProduct({ projectId, productId, staffName: 'Current User' });
    } catch (e) {
      console.log('Lock failed', e);
    }
  };

  const stats = useMemo(() => {
    if (!products) return { available: 0, locked: 0, sold: 0 };
    return products.reduce((acc: any, curr: any) => {
       if (curr.status === 'AVAILABLE') acc.available++;
       if (curr.status === 'LOCKED') acc.locked++;
       if (curr.status === 'SOLD') acc.sold++;
       return acc;
    }, { available: 0, locked: 0, sold: 0 });
  }, [products]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <View style={styles.header}>
        <LinearGradient 
          colors={isDark ? ['#065F46', '#022c22'] : ['#ECFDF5', '#D1FAE5']} 
          style={StyleSheet.absoluteFillObject} 
        />
        <BlurView intensity={isDark ? 30 : 60} tint={isDark ? "dark" : "light"} style={styles.headerContent}>
          <Text style={[typography.h1, { color: isDark ? '#34D399' : '#065F46' }]}>Bảng Hàng Trực Tuyến</Text>
          <Text style={[typography.body, { color: isDark ? '#A7F3D0' : '#059669', opacity: 0.8 }]}>Quản trị rổ hàng & Giữ chỗ realtime</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {['ALL', 'AVAILABLE', 'LOCKED', 'SOLD'].map(f => {
              const active = filter === f;
              return (
                <TouchableOpacity 
                  key={f} 
                  onPress={() => setFilter(f)} 
                  style={[
                    styles.filterBtn, 
                    active && styles.filterBtnActive,
                    { 
                      backgroundColor: active 
                        ? '#059669' 
                        : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(5, 150, 105, 0.1)') 
                    }
                  ]}
                >
                  <Text style={[
                      typography.smallBold, 
                      { color: active ? '#FFF' : (isDark ? '#A7F3D0' : '#047857') }
                    ]}
                  >
                    {f}
                    {f === 'AVAILABLE' && ` (${stats.available})`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </BlurView>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ width: '100%', alignItems: 'center', marginTop: 80 }}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={[typography.body, { color: theme.colors.textSecondary, marginTop: 12 }]}>Đang đồng bộ dữ liệu...</Text>
          </View>
        ) : (
          products?.map((unit: any) => {
            const isAvail = unit.status === 'AVAILABLE';
            const isLocked = unit.status === 'LOCKED';
            const isSold = unit.status === 'SOLD';

            let borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
            let bgColor = theme.colors.bgCard;
            let glowStyles = {};

            if (isAvail) {
              borderColor = '#34D399';
              bgColor = isDark ? 'rgba(5, 150, 105, 0.1)' : 'rgba(209, 250, 229, 0.4)';
              glowStyles = Platform.OS === 'web' ? { boxShadow: '0 0 16px rgba(52, 211, 153, 0.2)' } : {};
            } else if (isLocked) {
              borderColor = '#F59E0B';
              bgColor = isDark ? 'rgba(245, 158, 11, 0.05)' : 'rgba(254, 243, 199, 0.4)';
            } else if (isSold) {
              bgColor = isDark ? 'rgba(0,0,0,0.2)' : 'rgba(241, 245, 249, 0.6)';
            }

            return (
              <View 
                key={unit.id} 
                style={[
                  styles.unitCard,
                  { backgroundColor: bgColor, borderColor },
                  glowStyles,
                  (isSold && { opacity: 0.6 })
                ]}
              >
                <View style={styles.unitHeader}>
                  <Text style={[typography.h3, { color: theme.colors.text }]}>{unit.code}</Text>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(unit.status) }]} />
                </View>
                
                <Text style={[typography.small, { color: theme.colors.textSecondary }]}>
                  {unit.area} m² • {unit.bedrooms} BR
                </Text>
                
                <Text style={[typography.h2, { color: isAvail ? theme.colors.success : theme.colors.text, marginVertical: 12 }]}>
                  {unit.price} Tỷ
                </Text>

                {isAvail ? (
                  <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: theme.colors.success }]} 
                    onPress={() => handleLock(unit.id)}
                    disabled={isLocking}
                  >
                    <Lock size={14} color="#FFF" />
                    <Text style={[typography.smallBold, { color: '#FFF' }]}>Giữ Chỗ</Text>
                  </TouchableOpacity>
                ) : isLocked ? (
                  <View style={[styles.alertArea, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#FEF3C7' }]}>
                    <ShieldAlert size={14} color="#D97706" />
                    <Text style={[typography.caption, { color: '#D97706', marginLeft: 4 }]} numberOfLines={1}>
                      Lock: {unit.bookedBy || 'N/A'}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.alertArea, { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2' }]}>
                    <BadgeCheck size={14} color="#DC2626" />
                    <Text style={[typography.caption, { color: '#DC2626', marginLeft: 4 }]}>Đã bán</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
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
  header: { overflow: 'hidden' },
  headerContent: { 
    padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } as any : {})
  },
  filterRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  filterBtnActive: { },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 20, gap: 16, paddingBottom: 80 },
  unitCard: {
    width: '47%', 
    minWidth: 160,
    borderRadius: 16, 
    padding: 16,
    borderWidth: 1, 
  },
  unitHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  btn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 10, borderRadius: 10, gap: 6,
    shadowColor: '#10B981', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3
  },
  alertArea: { 
    padding: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
  }
});
