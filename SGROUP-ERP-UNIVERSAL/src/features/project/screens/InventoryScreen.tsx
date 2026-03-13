import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { typography, useTheme } from '../../../shared/theme/theme';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGCard, SGButton } from '../../../shared/ui/components';
import { useProjects, useProjectProducts } from '../hooks/useProjects';
import { Grid3x3, Search, Filter, Lock, Unlock, CheckCircle } from 'lucide-react-native';

export function InventoryScreen() {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: products, isLoading: productsLoading, refetch } = useProjectProducts(selectedProjectId || '');

  // Auto-select first project if none selected
  React.useEffect(() => {
    if (projects && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#10b981'; // Green
      case 'LOCKED': return '#f59e0b'; // Orange
      case 'BOOKED': return '#f97316'; // Orange-red
      case 'PENDING_DEPOSIT': return '#3b82f6'; // Blue
      case 'DEPOSIT': return '#8b5cf6'; // Purple
      case 'SOLD': return '#ef4444'; // Red
      case 'COMPLETED': return '#64748b'; // Gray
      default: return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Sẵn sàng';
      case 'LOCKED': return 'Đang Lock';
      case 'BOOKED': return 'Đã đặt chỗ';
      case 'PENDING_DEPOSIT': return 'Chờ cọc';
      case 'DEPOSIT': return 'Đã cọc';
      case 'SOLD': return 'Đã bán';
      case 'COMPLETED': return 'Hoàn tất';
      default: return status;
    }
  };

  const renderProductItem = ({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.status);
    
    return (
      <View style={[
        styles.productCard, 
        { 
          backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#fff',
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          borderTopColor: statusColor,
          borderTopWidth: 3
        }
      ]}>
        <View style={styles.productHeader}>
          <Text style={[typography.h4, { color: colors.text }]}>{item.code}</Text>
          <View style={[styles.badge, { backgroundColor: isDark ? `${statusColor}20` : `${statusColor}15` }]}>
            <Text style={[typography.micro, { color: statusColor, fontWeight: '700' }]}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>
        
        <View style={styles.productBody}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>Tầng {item.floor} • {item.bedrooms} PN</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>Diện tích: {item.area} m²</Text>
          <Text style={[typography.body, { color: colors.text, marginTop: 8, fontWeight: '700' }]}>
            {item.price ? `${item.price.toLocaleString('vi-VN')} Tỷ` : 'Đang cập nhật'}
          </Text>
        </View>

        <View style={styles.productFooter}>
          {item.status === 'AVAILABLE' && (
            <SGButton title="Lock Căn" size="sm" variant="outline" style={{ flex: 1 }} />
          )}
          {item.status === 'LOCKED' && !item.bookedBy && (
            <SGButton title="Mở Lock" size="sm" variant="outline" style={{ flex: 1 }} />
          )}
          {['LOCKED', 'BOOKED', 'PENDING_DEPOSIT', 'DEPOSIT', 'SOLD', 'COMPLETED'].includes(item.status) && item.bookedBy && (
            <Text style={[typography.micro, { color: colors.textTertiary, textAlign: 'center', width: '100%' }]}>
              Bởi: {item.bookedBy}
            </Text>
          )}
          {['DEPOSIT', 'SOLD', 'COMPLETED'].includes(item.status) && !item.bookedBy && (
            <Text style={[typography.micro, { color: colors.textTertiary, textAlign: 'center', width: '100%' }]}>
              Đã giao dịch
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[typography.h2, { color: colors.text, marginBottom: 8 }]}>Quản lý Bảng hàng</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Theo dõi trạng thái và khóa căn đối với các sản phẩm của dự án
          </Text>
        </View>
        <SGButton title="Thêm Sản phẩm" icon={<Grid3x3 size={20} color="#fff" />} />
      </View>

      {/* Project Selector Tabs */}
      <View style={{ marginBottom: 24 }}>
        <Text style={[typography.body, { color: colors.textSecondary, marginBottom: 12, fontWeight: '700' }]}>Chọn Dự án:</Text>
        {projectsLoading ? (
          <ActivityIndicator size="small" color="#10b981" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {projects?.map(project => (
              <TouchableOpacity
                key={project.id}
                onPress={() => setSelectedProjectId(project.id)}
                style={[
                  styles.projectTab,
                  { 
                    backgroundColor: selectedProjectId === project.id 
                      ? '#10b981' 
                      : (isDark ? 'rgba(30,41,59,0.8)' : '#fff'),
                    borderColor: selectedProjectId === project.id 
                      ? '#10b981' 
                      : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                  }
                ]}
              >
                <Text style={[
                  typography.body, 
                  { color: selectedProjectId === project.id ? '#fff' : colors.text, fontWeight: '600' }
                ]}>
                  {project.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Inventory Grid */}
      <SGCard style={{ flex: 1, padding: 24 }}>
        <View style={styles.toolbar}>
          <Text style={[typography.h4, { color: colors.text }]}>
            Bảng hàng {projects?.find(p => p.id === selectedProjectId)?.name || ''}
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <SGButton title="Bộ lọc" variant="outline" size="sm" icon={<Filter size={16} color={colors.text} />} />
          </View>
        </View>

        {productsLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : !products || products.length === 0 ? (
          <View style={styles.centerContainer}>
            <Grid3x3 size={48} color={colors.textTertiary} opacity={0.5} style={{ marginBottom: 16 }} />
            <Text style={[typography.body, { color: colors.textSecondary }]}>Chưa có sản phẩm nào trong bảng hàng</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            renderItem={renderProductItem}
            numColumns={4}
            columnWrapperStyle={{ gap: 16 }}
            contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SGCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  projectTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  productCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 160,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  productBody: {
    flex: 1,
  },
  productFooter: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  }
});
