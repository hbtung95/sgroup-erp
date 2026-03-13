import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { typography, useTheme } from '../../../shared/theme/theme';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGCard, SGButton } from '../../../shared/ui/components';
import { useProject, useProjectProducts } from '../hooks/useProjects';
import { ArrowLeft, Building2, MapPin, Grid3x3, CheckCircle2 } from 'lucide-react-native';
import { formatTy } from '../../../shared/utils/formatters';

interface Props {
  projectId: string;
  onBack: () => void;
}

export function ProjectDetailView({ projectId, onBack }: Props) {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  
  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProject(projectId);
  const { data: products, isLoading: isProductsLoading } = useProjectProducts(projectId);

  if (isProjectLoading) {
    return (
      <View style={[styles.centerContainer, { minHeight: 400 }]}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (isProjectError || !project) {
    return (
      <View style={[styles.centerContainer, { minHeight: 400 }]}>
        <Text style={[typography.body, { color: '#ef4444' }]}>Lỗi khi tải thông tin chi tiết dự án.</Text>
        <SGButton title="Quay lại" onPress={onBack} variant="outline" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeft size={20} color={colors.textSecondary} />
          <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 8, fontWeight: '600' }]}>Danh sách</Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16 }}>
          <View>
            <Text style={[typography.h2, { color: colors.text, marginBottom: 8 }]}>{project.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: project.status === 'ACTIVE' ? (isDark ? 'rgba(16,185,129,0.2)' : '#d1fae5') : (isDark ? 'rgba(100,116,139,0.2)' : '#f1f5f9') }
              ]}>
                <Text style={[typography.micro, { color: project.status === 'ACTIVE' ? '#10b981' : colors.textSecondary, fontWeight: '700' }]}>
                  {project.status === 'ACTIVE' ? 'ĐANG MỞ BÁN' : project.status}
                </Text>
              </View>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Mã: {project.projectCode}</Text>
            </View>
          </View>
          <SGButton title="Chỉnh sửa" variant="secondary" />
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 24, paddingHorizontal: 24, flex: 1 }}>
        {/* Left Column: Info & Stats */}
        <View style={{ flex: 1, maxWidth: 360 }}>
          <SGCard style={{ padding: 24, marginBottom: 24 }}>
            <Text style={[typography.h4, { color: colors.text, marginBottom: 20 }]}>Thông tin chung</Text>
            
            <View style={styles.infoRow}>
              <Text style={[typography.micro, { color: colors.textSecondary, width: 100 }]}>Chủ đầu tư</Text>
              <Text style={[typography.body, { color: colors.text, flex: 1, fontWeight: '600' }]}>{project.developer || 'Đang cập nhật'}</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={[typography.micro, { color: colors.textSecondary, width: 100 }]}>Vị trí</Text>
              <Text style={[typography.body, { color: colors.text, flex: 1, fontWeight: '600' }]}>{project.location || 'Đang cập nhật'}</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={[typography.micro, { color: colors.textSecondary, width: 100 }]}>Loại hình</Text>
              <Text style={[typography.body, { color: colors.text, flex: 1, fontWeight: '600' }]}>{project.type || 'Đang cập nhật'}</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={[typography.micro, { color: colors.textSecondary, width: 100 }]}>Quy mô</Text>
              <Text style={[typography.body, { color: colors.text, flex: 1, fontWeight: '600' }]}>{project.totalUnits || 0} sản phẩm</Text>
            </View>
          </SGCard>

          <SGCard style={{ padding: 24 }}>
            <Text style={[typography.h4, { color: colors.text, marginBottom: 20 }]}>Tiến độ & Hiệu quả</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View>
                <Text style={[typography.micro, { color: colors.textSecondary }]}>Đã bán / Tổng SP</Text>
                <Text style={[typography.h3, { color: colors.text, marginTop: 4 }]}>
                  <Text style={{ color: '#10b981' }}>{project.soldUnits || 0}</Text> / {project.totalUnits || 0}
                </Text>
              </View>
              <View
                style={{
                  width: 50, height: 50, borderRadius: 25,
                  borderWidth: 4, borderColor: '#10b981',
                  justifyContent: 'center', alignItems: 'center'
                }}
              >
                <Text style={[typography.micro, { color: '#10b981', fontWeight: 'bold' }]}>
                  {project.totalUnits ? Math.round(((project.soldUnits || 0) / project.totalUnits) * 100) : 0}%
                </Text>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <View>
                <Text style={[typography.micro, { color: colors.textSecondary }]}>Giá trung bình</Text>
                <Text style={[typography.h4, { color: '#3b82f6', marginTop: 4 }]}>{project.avgPrice ? formatTy(project.avgPrice) : 'N/A'}</Text>
              </View>
              <View>
                <Text style={[typography.micro, { color: colors.textSecondary }]}>Hoa hồng</Text>
                <Text style={[typography.h4, { color: '#f59e0b', marginTop: 4 }]}>{project.feeRate || 0}%</Text>
              </View>
            </View>
          </SGCard>
        </View>

        {/* Right Column: Inventory */}
        <View style={{ flex: 1 }}>
          <SGCard style={{ flex: 1, padding: 24, minHeight: 500 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={[typography.h4, { color: colors.text }]}>Danh sách Sản phẩm</Text>
              <SGButton title="Quản lý Bảng hàng" variant="outline" size="sm" />
            </View>

            {isProductsLoading ? (
              <View style={[styles.centerContainer, { flex: 1 }]}>
                <ActivityIndicator color="#3b82f6" />
              </View>
            ) : (!products || products.length === 0) ? (
              <View style={[styles.centerContainer, { flex: 1 }]}>
                <Grid3x3 size={48} color={colors.textTertiary} opacity={0.5} style={{ marginBottom: 16 }} />
                <Text style={[typography.body, { color: colors.textSecondary, fontWeight: '700', fontSize: 16 }]}>Chưa có sản phẩm nào</Text>
                <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 8 }]}>Dự án chưa import bảng hàng</Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }}>
                <View style={[styles.tableRow, { borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 12 }]}>
                  <Text style={[typography.micro, { color: colors.textSecondary, width: 80 }]}>MÃ CĂN</Text>
                  <Text style={[typography.micro, { color: colors.textSecondary, width: 80 }]}>BLOCK/TẦNG</Text>
                  <Text style={[typography.micro, { color: colors.textSecondary, width: 80 }]}>DIỆN TÍCH</Text>
                  <Text style={[typography.micro, { color: colors.textSecondary, width: 100 }]}>GIÁ BÁN</Text>
                  <Text style={[typography.micro, { color: colors.textSecondary, flex: 1, textAlign: 'right' }]}>TRẠNG THÁI</Text>
                </View>
                
                {products.map((p: any, idx) => (
                  <View key={p.id} style={[styles.tableRow, { 
                    paddingVertical: 14, 
                    borderBottomColor: idx < products.length - 1 ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)') : 'transparent', 
                    borderBottomWidth: idx < products.length - 1 ? 1 : 0 
                  }]}>
                    <Text style={[typography.body, { color: colors.text, width: 80, fontWeight: '700' }]}>{p.code}</Text>
                    <Text style={[typography.body, { color: colors.textSecondary, width: 80 }]}>{p.block || '-'}/{p.floor || '-'}</Text>
                    <Text style={[typography.body, { color: colors.textSecondary, width: 80 }]}>{p.area || 0} m²</Text>
                    <Text style={[typography.body, { color: colors.text, width: 100, fontWeight: '600' }]}>{p.price ? formatTy(p.price) : 'N/A'}</Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <View style={{ backgroundColor: p.status === 'AVAILABLE' ? (isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5') : (isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb'), paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={[typography.micro, { color: p.status === 'AVAILABLE' ? '#10b981' : '#f59e0b', fontWeight: '700' }]}>{p.status === 'AVAILABLE' ? 'CÒN TRỐNG' : p.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </SGCard>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingBottom: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150,150,150,0.1)',
    marginVertical: 14,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});
