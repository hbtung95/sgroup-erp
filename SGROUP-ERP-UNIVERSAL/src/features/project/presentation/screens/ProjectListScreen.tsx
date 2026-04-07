import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useGetProjects } from '../../application/hooks/useProjectQueries';
import { SGCard, SGBadge } from '../../../../shared/ui/components';
import { typography, sgds } from '../../../../shared/theme/theme';
import { useAppTheme } from '../../../../shared/theme/useAppTheme';
import { MapPin, Grid, Plus, Building2 } from 'lucide-react-native';
import { ProjectFormModal } from '../components/ProjectFormModal';

export const ProjectListScreen = ({ onNavigateInventory }: { onNavigateInventory?: (id: string) => void }) => {
  const { data: projects, isLoading } = useGetProjects();
  const { theme, isDark } = useAppTheme();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setModalVisible(true);
  };

  const handleAddNew = () => {
    setEditingProject(null);
    setModalVisible(true);
  };

  // Dynamic colors
  const cText = theme.colors.text;
  const cSub = theme.colors.textSecondary;
  const cBrand = theme.colors.brand;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      <BlurView intensity={isDark ? 30 : 60} tint={isDark ? "dark" : "light"} style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={[typography.h1, { color: cText }]}>Danh Sách Dự Án</Text>
            <Text style={[typography.body, { color: cSub }]}>Quản lý tổng thể danh mục dự án SGROUP</Text>
          </View>
          <TouchableOpacity 
            style={[styles.btnPrimary, { backgroundColor: cBrand }]} 
            onPress={handleAddNew}
            activeOpacity={0.8}
          >
            <Plus size={18} color="#FFF" />
            <Text style={[typography.bodyBold, { color: '#FFF' }]}>Thêm Dự Án</Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={cBrand} />
            <Text style={[typography.body, { color: cSub, marginTop: 12 }]}>Đang tải dữ liệu...</Text>
          </View>
        ) : projects?.length === 0 ? (
          <View style={styles.emptyState}>
            <Building2 size={48} color={theme.colors.borderStrong} />
            <Text style={[typography.h3, { color: cSub, marginTop: 16 }]}>Chưa có dự án nào</Text>
            <Text style={[typography.small, { color: theme.colors.textTertiary, marginTop: 4 }]}>Hãy bắt đầu bằng cách thêm dự án đầu tiên.</Text>
          </View>
        ) : (
          projects?.map((p: any) => {
            const isActive = p.status === 'ACTIVE';
            
            return (
              <SGCard 
                key={p.id} 
                style={[
                  styles.card,
                  { 
                    backgroundColor: theme.colors.bgCard,
                    borderColor: theme.colors.border,
                  }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.h2, { color: cText }]}>{p.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6 }}>
                      <MapPin size={14} color={cSub} />
                      <Text style={[typography.small, { color: cSub }]}>{p.location || 'Chưa cập nhật'}</Text>
                    </View>
                  </View>
                  <View style={[styles.badge, { backgroundColor: isActive ? theme.colors.successBg : theme.colors.warningBg }]}>
                    <Text style={[typography.micro, { color: isActive ? theme.colors.success : theme.colors.warning }]}>
                      {p.status}
                    </Text>
                  </View>
                </View>

                <View style={[styles.statsRow, { backgroundColor: theme.colors.bgInput }]}>
                  <View style={styles.statBox}>
                    <Text style={[typography.caption, { color: cSub, textTransform: 'uppercase' }]}>Loại Hình</Text>
                    <Text style={[typography.bodyBold, { color: cText, marginTop: 4 }]}>{p.type || 'N/A'}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[typography.caption, { color: cSub, textTransform: 'uppercase' }]}>Tổng SP</Text>
                    <Text style={[typography.bodyBold, { color: cText, marginTop: 4 }]}>{p.totalUnits || 0}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[typography.caption, { color: cSub, textTransform: 'uppercase' }]}>Đã Bán</Text>
                    <Text style={[typography.bodyBold, { color: theme.colors.success, marginTop: 4 }]}>{p.soldUnits || 0}</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity 
                    style={[styles.btnSecondary, { backgroundColor: theme.colors.bgInput }]} 
                    onPress={() => handleEdit(p)}
                  >
                    <Text style={[typography.bodyBold, { color: cText }]}>Sửa Dự Án</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.btnPrimary, { backgroundColor: theme.colors.success }]}
                    onPress={() => onNavigateInventory?.(p.id)}
                  >
                    <Grid size={16} color="#FFF" />
                    <Text style={[typography.bodyBold, { color: '#FFF' }]}>Bảng Hàng</Text>
                  </TouchableOpacity>
                </View>
              </SGCard>
            );
          })
        )}
      </ScrollView>

      <ProjectFormModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
        editData={editingProject} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    padding: 32, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: 24, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(0,0,0,0.05)',
    zIndex: 10,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } as any : {})
  },
  list: { padding: 24, gap: 20, paddingBottom: 60 },
  emptyState: { alignItems: 'center', marginTop: 60, padding: 40, borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)' },
  card: { padding: 24, borderRadius: 20, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24, padding: 16, borderRadius: 16 },
  statBox: { flex: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btnSecondary: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  btnPrimary: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }
});
