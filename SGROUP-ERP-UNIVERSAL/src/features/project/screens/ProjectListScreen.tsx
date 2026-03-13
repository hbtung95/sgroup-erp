import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, RefreshControl, TextInput } from 'react-native';
import { typography, useTheme } from '../../../shared/theme/theme';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGCard, SGButton } from '../../../shared/ui/components';
import { useProjects, useDeleteProject } from '../hooks/useProjects';
import { Building2, Plus, MapPin, Search, Trash2 } from 'lucide-react-native';
import { formatTy } from '../../../shared/utils/formatters';
import { ProjectDetailView } from './ProjectDetailView';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useToast } from '../../sales/components/ToastProvider';

interface Props {
  onNavigateInventory?: (projectId: string) => void;
}

export function ProjectListScreen({ onNavigateInventory }: Props) {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { showToast } = useToast();
  const { data: projects, isLoading, isError, refetch, isRefetching } = useProjects();
  const deleteMutation = useDeleteProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  const [deletingProject, setDeletingProject] = useState<any | null>(null);

  const filteredProjects = useMemo(() => {
    const safeProjects = Array.isArray(projects) ? projects : [];
    if (!searchQuery) return safeProjects;
    const lowerQ = searchQuery.toLowerCase();
    return safeProjects.filter((p: any) => 
      p.name?.toLowerCase().includes(lowerQ) || 
      p.projectCode?.toLowerCase().includes(lowerQ) ||
      p.developer?.toLowerCase().includes(lowerQ)
    );
  }, [projects, searchQuery]);

  const handleOpenCreate = () => {
    setEditProject(null);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    try {
      await deleteMutation.mutateAsync(deletingProject.id);
      showToast(`Đã xóa dự án "${deletingProject.name}"`, 'success');
      setDeletingProject(null);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Lỗi không xác định';
      showToast(`Xóa thất bại: ${msg}`, 'error');
    }
  };

  const renderProjectItem = ({ item }: { item: any }) => {
    return (
      <SGCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5' }]}>
              <Building2 size={24} color="#10b981" />
            </View>
            <View style={{ marginLeft: 16, flex: 1 }}>
              <Text style={[typography.h4, { color: colors.text }]}>{item.name}</Text>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Mã: {item.projectCode}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.status === 'ACTIVE' ? (isDark ? 'rgba(16,185,129,0.2)' : '#d1fae5') 
                : item.status === 'PAUSED' ? (isDark ? 'rgba(245,158,11,0.2)' : '#fef3c7')
                : (isDark ? 'rgba(100,116,139,0.2)' : '#f1f5f9') }
            ]}>
              <Text style={[
                typography.micro, 
                { color: item.status === 'ACTIVE' ? '#10b981' : item.status === 'PAUSED' ? '#f59e0b' : colors.textSecondary, fontWeight: '700' }
              ]}>
                {item.status === 'ACTIVE' ? 'ĐANG BÁN' : item.status === 'PAUSED' ? 'TẠM DỪNG' : 'ĐÃ ĐÓNG'}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setDeletingProject(item)} 
              style={[styles.miniBtn, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2' }]}
            >
              <Trash2 size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={[typography.micro, { color: colors.textSecondary, width: 90 }]}>Chủ đầu tư</Text>
            <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{item.developer || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: 90 }}>
              <MapPin size={12} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[typography.micro, { color: colors.textSecondary }]}>Vị trí</Text>
            </View>
            <Text style={[typography.body, { color: colors.text, flex: 1 }]} numberOfLines={1}>{item.location || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[typography.micro, { color: colors.textSecondary, width: 90 }]}>Loại hình</Text>
            <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{item.type || 'N/A'}</Text>
          </View>

          <View style={[styles.statsRow, { borderTopColor: colors.border, borderTopWidth: 1 }]}>
            <View style={styles.statBox}>
              <Text style={[typography.micro, { color: colors.textSecondary }]}>Tổng sản phẩm</Text>
              <Text style={[typography.body, { color: colors.text, marginTop: 4, fontWeight: '700' }]}>{item.totalUnits || 0}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[typography.micro, { color: colors.textSecondary }]}>Đã bán</Text>
              <Text style={[typography.body, { color: '#10b981', marginTop: 4, fontWeight: '700' }]}>{item.soldUnits || 0}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[typography.micro, { color: colors.textSecondary }]}>Giá TB</Text>
              <Text style={[typography.body, { color: '#3b82f6', marginTop: 4, fontWeight: '700' }]}>{item.avgPrice ? `${item.avgPrice} Tỷ` : 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <SGButton 
            title="Xem Bảng Hàng" variant="outline" size="sm" 
            style={{ flex: 1, marginRight: 8 }} 
            onPress={() => onNavigateInventory?.(item.id)}
          />
          <SGButton title="Chi tiết" variant="secondary" size="sm" style={{ flex: 1 }} onPress={() => setSelectedProjectId(item.id)} />
        </View>
      </SGCard>
    );
  };

  if (selectedProjectId) {
    return (
      <ProjectDetailView 
        projectId={selectedProjectId} 
        onBack={() => setSelectedProjectId(null)}
        onNavigateInventory={onNavigateInventory}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ProjectFormModal visible={showForm} onClose={() => setShowForm(false)} editData={editProject} />
      <DeleteConfirmModal
        visible={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        message={`Bạn có chắc chắn muốn xóa dự án "${deletingProject?.name}"?\n\nTất cả sản phẩm liên quan có thể bị ảnh hưởng. Hành động này không thể hoàn tác.`}
        isLoading={deleteMutation.isPending}
      />

      <View style={styles.header}>
        <View>
          <Text style={[typography.h2, { color: colors.text, marginBottom: 8 }]}>Danh mục Dự án</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Quản lý thông tin tổng quan của tất cả dự án bất động sản
          </Text>
        </View>
        <SGButton title="Thêm Dự án" icon={<Plus size={20} color="#fff" />} onPress={handleOpenCreate} />
      </View>

      {isLoading && !isRefetching ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <Text style={[typography.body, { color: '#ef4444' }]}>Đã xảy ra lỗi khi tải danh sách dự án.</Text>
          <SGButton title="Thử lại" onPress={() => refetch()} variant="outline" style={{ marginTop: 16 }} />
        </View>
      ) : (
        <>
          <View style={styles.filterRow}>
            <View style={[styles.searchBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }]}>
              <Search size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text, outlineStyle: 'none' as any }]}
                placeholder="Tìm kiếm theo Tên, Mã, Chủ đầu tư..."
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        
          <FlatList
            data={filteredProjects}
            keyExtractor={(item) => item.id}
            renderItem={renderProjectItem}
            contentContainerStyle={{ paddingBottom: 40 }}
            numColumns={2}
            columnWrapperStyle={{ gap: 24 }}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#10b981" />
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Building2 size={48} color={colors.textTertiary} opacity={0.5} style={{ marginBottom: 16 }} />
                <Text style={[typography.body, { color: colors.textSecondary, fontWeight: '700', fontSize: 16 }]}>Chưa có dự án nào</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 },
  card: { flex: 1, padding: 0, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  cardBody: { paddingHorizontal: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 16, paddingBottom: 16 },
  statBox: { flex: 1 },
  cardFooter: { flexDirection: 'row', padding: 20, paddingTop: 0 },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 44, borderRadius: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif", fontSize: 14, height: '100%' },
  miniBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});
