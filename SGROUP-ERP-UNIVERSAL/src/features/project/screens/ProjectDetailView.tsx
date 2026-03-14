import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { typography, useTheme } from '../../../shared/theme/theme';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGCard, SGButton } from '../../../shared/ui/components';
import { useProject, useProjectProducts } from '../hooks/useProjects';
import { ArrowLeft, Building2, MapPin, Grid3x3, CheckCircle2, Edit2, TrendingUp, DollarSign, Percent, Layers, Package } from 'lucide-react-native';
import { formatTy } from '../../../shared/utils/formatters';
import { ProjectFormModal } from '../components/ProjectFormModal';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;

interface Props {
  projectId: string;
  onBack: () => void;
  onNavigateInventory?: (projectId: string) => void;
}

export function ProjectDetailView({ projectId, onBack, onNavigateInventory }: Props) {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const [showEditForm, setShowEditForm] = useState(false);
  
  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProject(projectId);
  const { data: products, isLoading: isProductsLoading } = useProjectProducts(projectId);

  const safeProducts = Array.isArray(products) ? products : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return '#10b981';
      case 'LOCKED': return '#f59e0b';
      case 'BOOKED': return '#f97316';
      case 'PENDING_DEPOSIT': return '#3b82f6';
      case 'DEPOSIT': return '#8b5cf6';
      case 'SOLD': return '#ef4444';
      case 'COMPLETED': return '#64748b';
      default: return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'CÒN TRỐNG';
      case 'LOCKED': return 'ĐANG LOCK';
      case 'BOOKED': return 'ĐÃ ĐẶT';
      case 'PENDING_DEPOSIT': return 'CHỜ CỌC';
      case 'DEPOSIT': return 'ĐÃ CỌC';
      case 'SOLD': return 'ĐÃ BÁN';
      case 'COMPLETED': return 'HOÀN TẤT';
      default: return status;
    }
  };

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

  const liquidityPct = project.totalUnits ? Math.round(((project.soldUnits || 0) / project.totalUnits) * 100) : 0;
  const totalValue = (project.avgPrice || 0) * (project.totalUnits || 0);

  // Status distribution from products
  const statusCounts = safeProducts.reduce((acc: Record<string, number>, p: any) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const kpiCards = [
    { label: 'Tổng Sản phẩm', value: project.totalUnits || 0, icon: Layers, color: '#3b82f6', bg: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff' },
    { label: 'Đã Bán', value: project.soldUnits || 0, icon: CheckCircle2, color: '#10b981', bg: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5' },
    { label: 'Giá TB', value: project.avgPrice ? formatTy(project.avgPrice) : 'N/A', icon: DollarSign, color: '#8b5cf6', bg: isDark ? 'rgba(139,92,246,0.1)' : '#f5f3ff' },
    { label: 'Hoa hồng', value: `${project.feeRate || 0}%`, icon: Percent, color: '#f59e0b', bg: isDark ? 'rgba(245,158,11,0.1)' : '#fffbeb' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <ProjectFormModal visible={showEditForm} onClose={() => setShowEditForm(false)} editData={project as any} />

      {/* Aurora Backdrop */}
      {Platform.OS === 'web' && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 0, overflow: 'hidden' }]} pointerEvents="none">
          <View style={{
            position: 'absolute', top: '-10%', right: '-8%', width: 600, height: 600,
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.04)' : 'rgba(16, 185, 129, 0.03)',
            borderRadius: 300,
          } as any} />
          <View style={{
            position: 'absolute', bottom: '10%', left: '-5%', width: 400, height: 400,
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.04)' : 'rgba(59, 130, 246, 0.02)',
            borderRadius: 200,
          } as any} />
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { zIndex: 1 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <View style={[styles.backIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9' }]}>
            <ArrowLeft size={18} color={colors.textSecondary} />
          </View>
          <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 10, fontWeight: '600' }]}>Danh sách Dự án</Text>
        </TouchableOpacity>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 24 }}>
          <View style={{ flex: 1 }}>
            {/* Status color bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: project.status === 'ACTIVE' ? (isDark ? 'rgba(16,185,129,0.15)' : '#ecfdf5') 
                  : project.status === 'PAUSED' ? (isDark ? 'rgba(245,158,11,0.15)' : '#fffbeb')
                  : (isDark ? 'rgba(100,116,139,0.15)' : '#f8fafc'),
                  borderWidth: 1,
                  borderColor: project.status === 'ACTIVE' ? (isDark ? 'rgba(16,185,129,0.3)' : '#a7f3d0') 
                  : project.status === 'PAUSED' ? (isDark ? 'rgba(245,158,11,0.3)' : '#fde68a')
                  : (isDark ? 'rgba(100,116,139,0.3)' : '#e2e8f0')
                }
              ]}>
                <Text style={[typography.micro, { 
                  color: project.status === 'ACTIVE' ? '#10b981' : project.status === 'PAUSED' ? '#f59e0b' : colors.textSecondary, 
                  fontWeight: '800', fontSize: 10
                }]}>
                  {project.status === 'ACTIVE' ? 'ĐANG MỞ BÁN' : project.status === 'PAUSED' ? 'TẠM DỪNG' : 'ĐÃ ĐÓNG'}
                </Text>
              </View>
              <Text style={[typography.micro, { color: colors.textTertiary, fontWeight: '600' }]}>Mã: {project.projectCode}</Text>
            </View>

            <Text style={[typography.h1, { color: colors.text, fontWeight: '800', letterSpacing: -0.5, marginBottom: 6 }]}>{project.name}</Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <MapPin size={14} color={colors.textTertiary} />
              <Text style={[typography.body, { color: colors.textSecondary, fontSize: 14 }]}>{project.location || 'Chưa cập nhật vị trí'}</Text>
            </View>
          </View>
          <SGButton 
            title="Chỉnh sửa" 
            variant="outline"
            icon={<Edit2 size={16} color={colors.text} />}
            onPress={() => setShowEditForm(true)}
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }}
          />
        </View>
      </View>

      {/* KPI Cards Row */}
      <View style={[styles.kpiRow, { zIndex: 1 }]}>
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <View key={i} style={[
              styles.kpiCard, 
              isDark ? styles.glassCardDark : styles.glassCardLight,
              Platform.OS === 'web' && styles.glassEffect as any,
            ]}>
              <View style={[styles.kpiIconBox, { backgroundColor: kpi.bg }]}>
                <Icon size={20} color={kpi.color} />
              </View>
              <Text style={[typography.micro, { color: colors.textSecondary, fontWeight: '600', marginTop: 12 }]}>{kpi.label}</Text>
              <Text style={[typography.h3, { color: colors.text, fontWeight: '800', marginTop: 4 }]}>{kpi.value}</Text>
            </View>
          );
        })}
      </View>

      <View style={[styles.mainContent, { zIndex: 1 }]}>
        {/* Left Column: Info & Stats */}
        <View style={{ flex: isDesktop ? 1 : undefined, maxWidth: isDesktop ? 400 : undefined }}>
          {/* General Info Card */}
          <View style={[styles.sectionCard, isDark ? styles.glassCardDark : styles.glassCardLight, Platform.OS === 'web' && styles.glassEffect as any]}>
            <Text style={[typography.h4, { color: colors.text, marginBottom: 24, fontWeight: '800' }]}>Thông tin chung</Text>
            
            {[
              { label: 'Chủ đầu tư', value: project.developer || 'Đang cập nhật' },
              { label: 'Vị trí', value: project.location || 'Đang cập nhật' },
              { label: 'Loại hình', value: project.type || 'Đang cập nhật' },
              { label: 'Quy mô', value: `${project.totalUnits || 0} sản phẩm` },
            ].map((item, idx, arr) => (
              <View key={idx}>
                <View style={styles.infoRow}>
                  <Text style={[typography.micro, { color: colors.textTertiary, width: 100, fontWeight: '600' }]}>{item.label}</Text>
                  <Text style={[typography.body, { color: colors.text, flex: 1, fontWeight: '700' }]}>{item.value}</Text>
                </View>
                {idx < arr.length - 1 && <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]} />}
              </View>
            ))}
          </View>

          {/* Progress & Performance */}
          <View style={[styles.sectionCard, isDark ? styles.glassCardDark : styles.glassCardLight, Platform.OS === 'web' && styles.glassEffect as any, { marginTop: 24 }]}>
            <Text style={[typography.h4, { color: colors.text, marginBottom: 24, fontWeight: '800' }]}>Tiến độ & Hiệu quả</Text>
            
            {/* Liquidity Meter */}
            <View style={{ alignItems: 'center', marginBottom: 28 }}>
              <View style={{
                width: 100, height: 100, borderRadius: 50,
                borderWidth: 6,
                borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                justifyContent: 'center', alignItems: 'center',
                position: 'relative',
              }}>
                {/* Overlay colored arc - simplified as colored border */}
                <View style={{
                  position: 'absolute', width: 100, height: 100, borderRadius: 50,
                  borderWidth: 6,
                  borderColor: liquidityPct >= 70 ? '#10b981' : liquidityPct >= 40 ? '#f59e0b' : '#ef4444',
                  borderTopColor: 'transparent',
                  borderRightColor: liquidityPct > 25 ? (liquidityPct >= 70 ? '#10b981' : liquidityPct >= 40 ? '#f59e0b' : '#ef4444') : 'transparent',
                  borderBottomColor: liquidityPct > 50 ? (liquidityPct >= 70 ? '#10b981' : liquidityPct >= 40 ? '#f59e0b' : '#ef4444') : 'transparent',
                  borderLeftColor: liquidityPct > 75 ? (liquidityPct >= 70 ? '#10b981' : liquidityPct >= 40 ? '#f59e0b' : '#ef4444') : 'transparent',
                  transform: [{ rotate: '-45deg' }],
                }} />
                <Text style={[typography.h2, { color: colors.text, fontWeight: '800' }]}>{liquidityPct}%</Text>
              </View>
              <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 10, fontWeight: '600' }]}>Thanh khoản</Text>
            </View>

            {/* Progress bar */}
            <View style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={[typography.micro, { color: colors.textTertiary, fontWeight: '600' }]}>Đã bán / Tổng SP</Text>
                <Text style={[typography.micro, { color: colors.text, fontWeight: '800' }]}>
                  {project.soldUnits || 0} / {project.totalUnits || 0}
                </Text>
              </View>
              <View style={{ height: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ width: `${Math.min(liquidityPct, 100)}%`, height: '100%', backgroundColor: '#10b981', borderRadius: 4 } as any} />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', marginVertical: 20 }]} />
            
            {/* Value Stats */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[
                { label: 'Giá TB', value: project.avgPrice ? formatTy(project.avgPrice) : 'N/A', color: '#3b82f6' },
                { label: 'Hoa hồng', value: `${project.feeRate || 0}%`, color: '#f59e0b' },
                { label: 'Tổng GT', value: formatTy(totalValue), color: '#8b5cf6' },
              ].map((s, i) => (
                <View key={i} style={{ alignItems: 'center' }}>
                  <Text style={[typography.micro, { color: colors.textTertiary, fontWeight: '600' }]}>{s.label}</Text>
                  <Text style={[typography.h4, { color: s.color, marginTop: 6, fontWeight: '800' }]}>{s.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Right Column: Inventory */}
        <View style={{ flex: isDesktop ? 1.6 : undefined, marginTop: isDesktop ? 0 : 24 }}>
          <View style={[styles.sectionCard, isDark ? styles.glassCardDark : styles.glassCardLight, Platform.OS === 'web' && styles.glassEffect as any, { minHeight: 500 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.kpiIconBox, { backgroundColor: isDark ? 'rgba(59,130,246,0.1)' : '#eff6ff' }]}>
                  <Package size={18} color="#3b82f6" />
                </View>
                <View>
                  <Text style={[typography.h4, { color: colors.text, fontWeight: '800' }]}>Danh sách Sản phẩm</Text>
                  {safeProducts.length > 0 && (
                    <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 2 }]}>{safeProducts.length} sản phẩm</Text>
                  )}
                </View>
              </View>
              <SGButton 
                title="Quản lý Bảng hàng" 
                variant="outline" 
                size="sm" 
                onPress={() => onNavigateInventory?.(projectId)}
                style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }}
              />
            </View>

            {/* Status chips row */}
            {safeProducts.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {Object.entries(statusCounts).map(([status, count]) => (
                  <View key={status} style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
                    borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusColor(status) }} />
                    <Text style={[typography.micro, { color: colors.textSecondary, fontWeight: '600' }]}>
                      {getStatusLabel(status)} ({count as number})
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {isProductsLoading ? (
              <View style={[styles.centerContainer, { flex: 1, minHeight: 300 }]}>
                <ActivityIndicator color="#3b82f6" />
              </View>
            ) : safeProducts.length === 0 ? (
              <View style={[styles.centerContainer, { flex: 1, minHeight: 300 }]}>
                <Grid3x3 size={56} color={colors.textTertiary} opacity={0.3} style={{ marginBottom: 16 }} />
                <Text style={[typography.h4, { color: colors.textSecondary, fontWeight: '800' }]}>Chưa có sản phẩm nào</Text>
                <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 8 }]}>Dự án chưa import bảng hàng</Text>
              </View>
            ) : (
              <ScrollView style={{ flex: 1 }}>
                {/* Header row */}
                <View style={[styles.tableRow, { 
                  paddingBottom: 14, marginBottom: 4,
                  borderBottomWidth: 2, borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'  
                }]}>
                  <Text style={[styles.colCode, typography.micro, { color: colors.textTertiary, fontWeight: '700' }]}>MÃ CĂN</Text>
                  <Text style={[styles.colBlock, typography.micro, { color: colors.textTertiary, fontWeight: '700' }]}>BLOCK/TẦNG</Text>
                  <Text style={[styles.colArea, typography.micro, { color: colors.textTertiary, fontWeight: '700' }]}>DIỆN TÍCH</Text>
                  <Text style={[styles.colPrice, typography.micro, { color: colors.textTertiary, fontWeight: '700' }]}>GIÁ BÁN</Text>
                  <Text style={[styles.colStatus, typography.micro, { color: colors.textTertiary, fontWeight: '700', textAlign: 'right' }]}>TRẠNG THÁI</Text>
                </View>
                
                {safeProducts.map((p: any, idx: number) => {
                  const sc = getStatusColor(p.status);
                  const isLast = idx === safeProducts.length - 1;
                  return (
                    <View key={p.id} style={[styles.tableRow, { 
                      paddingVertical: 14,
                      backgroundColor: idx % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)'),
                      borderBottomColor: isLast ? 'transparent' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'), 
                      borderBottomWidth: isLast ? 0 : 1,
                      borderRadius: 8, paddingHorizontal: 8,
                    }]}>
                      <Text style={[styles.colCode, typography.body, { color: colors.text, fontWeight: '700' }]}>{p.code}</Text>
                      <Text style={[styles.colBlock, typography.body, { color: colors.textSecondary }]}>{p.block || '-'}/{p.floor || '-'}</Text>
                      <Text style={[styles.colArea, typography.body, { color: colors.textSecondary }]}>{p.area || 0} m²</Text>
                      <Text style={[styles.colPrice, typography.body, { color: colors.text, fontWeight: '600' }]}>{p.price ? formatTy(p.price) : 'N/A'}</Text>
                      <View style={[styles.colStatus, { flexDirection: 'row', justifyContent: 'flex-end' }]}>
                        <View style={{ 
                          backgroundColor: isDark ? `${sc}20` : `${sc}15`, 
                          paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
                          borderWidth: 1, borderColor: `${sc}30`,
                        }}>
                          <Text style={[typography.micro, { color: sc, fontWeight: '800', fontSize: 10 }]}>{getStatusLabel(p.status)}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
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
    paddingHorizontal: isDesktop ? 40 : 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: isDesktop ? 40 : 20,
    marginTop: 24,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  kpiCard: {
    flex: 1,
    minWidth: 160,
    padding: 20,
    borderRadius: 16,
  },
  kpiIconBox: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  glassEffect: {
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    } as any),
  },
  glassCardDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.65)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' } as any),
  },
  glassCardLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderColor: 'rgba(0, 0, 0, 0.04)',
    borderWidth: 1,
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)' } as any),
  },
  mainContent: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: 24,
    paddingHorizontal: isDesktop ? 40 : 20,
    marginTop: 24,
  },
  sectionCard: {
    padding: 28,
    borderRadius: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colCode: { width: 90 },
  colBlock: { width: 90 },
  colArea: { width: 90 },
  colPrice: { width: 110 },
  colStatus: { flex: 1 },
});
