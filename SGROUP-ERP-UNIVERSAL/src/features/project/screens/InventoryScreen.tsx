import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, ScrollView, Platform, TextInput, Dimensions } from 'react-native';
import { typography, useTheme } from '../../../shared/theme/theme';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGCard, SGButton } from '../../../shared/ui/components';
import { useProjects, useProjectProducts, useLockProduct, useUnlockProduct, useDeleteProduct } from '../hooks/useProjects';
import { Grid3x3, Lock, Unlock, Plus, Edit2, Trash2, Search, Download, Upload, X, Package, ArrowUpDown, Layers } from 'lucide-react-native';
import { ProductFormModal } from '../components/ProductFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useAuthStore } from '../../auth/store/authStore';
import { useToast } from '../../sales/components/ToastProvider';
import Papa from 'papaparse';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;
const NUM_COLUMNS = isDesktop ? 4 : width > 768 ? 3 : 2;

interface Props {
  initialProjectId?: string;
}

export function InventoryScreen({ initialProjectId }: Props) {
  const colors = useTheme();
  const { isDark } = useThemeStore();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(initialProjectId || null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [showBatchInput, setShowBatchInput] = useState(false);
  const [batchCSV, setBatchCSV] = useState('');

  const { data: products, isLoading: productsLoading } = useProjectProducts(selectedProjectId || '');
  const lockMutation = useLockProduct();
  const unlockMutation = useUnlockProduct();
  const deleteMutation = useDeleteProduct();

  React.useEffect(() => {
    if (projects && Array.isArray(projects) && projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  React.useEffect(() => {
    if (initialProjectId) setSelectedProjectId(initialProjectId);
  }, [initialProjectId]);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      AVAILABLE: '#10b981', LOCKED: '#f59e0b', BOOKED: '#f97316',
      PENDING_DEPOSIT: '#3b82f6', DEPOSIT: '#8b5cf6', SOLD: '#ef4444', COMPLETED: '#64748b',
    };
    return map[status] || colors.textSecondary;
  };
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      AVAILABLE: 'Sẵn sàng', LOCKED: 'Đang Lock', BOOKED: 'Đã đặt chỗ',
      PENDING_DEPOSIT: 'Chờ cọc', DEPOSIT: 'Đã cọc', SOLD: 'Đã bán', COMPLETED: 'Hoàn tất',
    };
    return map[status] || status;
  };

  const handleLock = async (productId: string, code: string) => {
    try {
      await lockMutation.mutateAsync({ projectId: selectedProjectId!, id: productId, staffName: user?.name || 'Unknown' });
      showToast(`Đã lock căn ${code}`, 'success');
    } catch (e: any) {
      showToast(e?.response?.data?.message || `Lock ${code} thất bại`, 'error');
    }
  };
  const handleUnlock = async (productId: string, code: string) => {
    try {
      await unlockMutation.mutateAsync({ projectId: selectedProjectId!, id: productId });
      showToast(`Đã mở lock căn ${code}`, 'success');
    } catch (e: any) {
      showToast(e?.response?.data?.message || `Unlock ${code} thất bại`, 'error');
    }
  };
  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteMutation.mutateAsync({ projectId: selectedProjectId!, id: deletingProduct.id });
      showToast(`Đã xóa ${deletingProduct.code}`, 'success');
      setDeletingProduct(null);
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Xóa thất bại', 'error');
    }
  };
  const handleEdit = (product: any) => { setEditingProduct(product); setShowProductForm(true); };
  const handleCloseForm = () => { setShowProductForm(false); setEditingProduct(null); };

  // ── ENH6: Export CSV ──
  const handleExportCSV = () => {
    if (Platform.OS !== 'web') { showToast('Export chỉ hỗ trợ trên Web', 'warning'); return; }
    const safeProducts = Array.isArray(products) ? products : [];
    if (safeProducts.length === 0) { showToast('Không có dữ liệu để xuất', 'warning'); return; }
    
    const data = safeProducts.map((p: any) => ({
      "Mã Căn": p.code,
      "Block": p.block || '',
      "Tầng": p.floor || '',
      "Diện tích": p.area || '',
      "Giá (Tỷ)": p.price || '',
      "Phòng ngủ": p.bedrooms || '',
      "Hướng": p.direction || '',
      "Trạng thái": p.status,
      "Người Lock": p.bookedBy || ''
    }));

    const csv = '\uFEFF' + Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const projectName = (Array.isArray(projects) ? projects : []).find((p: any) => p.id === selectedProjectId)?.name || 'inventory';
    a.download = `bang_hang_${projectName}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file CSV thành công!', 'success');
  };

  // ── ENH5: Batch Import Parse ──
  const handleBatchImport = async () => {
    if (!batchCSV.trim() || !selectedProjectId) return;
    try {
      const parsed = Papa.parse(batchCSV.trim(), { header: false, skipEmptyLines: true });
      if (parsed.errors.length > 0) {
        showToast('Lỗi parse CSV: Vui lòng kiểm tra định dạng data', 'error');
        return;
      }
      
      const items = parsed.data.map((row: any) => {
        const code = row[0]?.trim();
        const block = row[1]?.trim();
        const floor = parseInt(row[2]) || 0;
        const area = parseFloat(row[3]) || 0;
        const price = parseFloat(row[4]) || 0;
        const bedrooms = parseInt(row[5]) || 0;
        const direction = row[6]?.trim();

        if (!code) throw new Error('Mã căn không được để trống');

        return {
          projectId: selectedProjectId!,
          code,
          block: block || undefined,
          floor,
          area,
          price,
          bedrooms,
          direction: direction || undefined,
          status: 'AVAILABLE',
        };
      });

      const { projectApi } = await import('../api/projectApi');
      await projectApi.batchCreateProducts(selectedProjectId!, items);
      showToast(`Đã import ${items.length} sản phẩm!`, 'success');
      setShowBatchInput(false);
      setBatchCSV('');
    } catch (e: any) {
      showToast(e?.response?.data?.message || 'Import thất bại', 'error');
    }
  };

  // ── Filter + Search ──
  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = safeProducts.filter((p: any) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (p.code?.toLowerCase().includes(q) || p.block?.toLowerCase().includes(q) || String(p.floor).includes(q));
    }
    return true;
  });

  const STATUS_FILTERS = [
    { value: null, label: 'Tất cả', count: safeProducts.length },
    { value: 'AVAILABLE', label: 'Sẵn sàng', count: safeProducts.filter((p: any) => p.status === 'AVAILABLE').length },
    { value: 'LOCKED', label: 'Đang Lock', count: safeProducts.filter((p: any) => p.status === 'LOCKED').length },
    { value: 'BOOKED', label: 'Đã đặt chỗ', count: safeProducts.filter((p: any) => p.status === 'BOOKED').length },
    { value: 'SOLD', label: 'Đã bán', count: safeProducts.filter((p: any) => p.status === 'SOLD').length },
  ];

  const selectedProject = (Array.isArray(projects) ? projects : []).find((p: any) => p.id === selectedProjectId);

  const renderProductItem = ({ item }: { item: any }) => {
    const sc = getStatusColor(item.status);
    return (
      <View style={[
        styles.productCard, 
        isDark ? styles.glassCardDark : styles.glassCardLight,
        Platform.OS === 'web' && styles.glassEffect as any,
      ]}>
        {/* Status color strip */}
        <View style={{ height: 4, width: '100%', backgroundColor: sc, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
        
        <View style={styles.productInner}>
          <View style={styles.productHeader}>
            <Text style={[typography.h4, { color: colors.text, fontWeight: '800' }]}>{item.code}</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.miniBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }]}>
                <Edit2 size={13} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeletingProduct(item)} style={[styles.miniBtn, { backgroundColor: isDark ? 'rgba(239,68,68,0.08)' : '#fef2f2' }]}>
                <Trash2 size={13} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.badge, { backgroundColor: `${sc}18`, borderWidth: 1, borderColor: `${sc}30`, alignSelf: 'flex-start', marginBottom: 14 }]}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sc, marginRight: 6 }} />
            <Text style={[typography.micro, { color: sc, fontWeight: '800', fontSize: 10 }]}>{getStatusLabel(item.status)}</Text>
          </View>

          <View style={styles.productBody}>
            <View style={[styles.productInfoRow, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc', borderRadius: 10, padding: 10, marginBottom: 10 }]}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.micro, { color: colors.textTertiary, fontWeight: '600', marginBottom: 2 }]}>Block/Tầng</Text>
                <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>{item.block || '-'} / T{item.floor}</Text>
              </View>
              <View style={{ width: 1, height: 28, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text style={[typography.micro, { color: colors.textTertiary, fontWeight: '600', marginBottom: 2 }]}>Diện tích</Text>
                <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>{item.area} m²</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <View>
                {item.bedrooms > 0 && <Text style={[typography.micro, { color: colors.textSecondary, marginBottom: 2 }]}>{item.bedrooms} Phòng ngủ</Text>}
                {item.direction && <Text style={[typography.micro, { color: colors.textSecondary }]}>Hướng: {item.direction}</Text>}
              </View>
            </View>
            
            <View style={[styles.priceRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
              <Text style={[typography.h4, { color: '#3b82f6', fontWeight: '800' }]}>
                {item.price ? `${item.price.toLocaleString('vi-VN')} Tỷ` : 'Đang cập nhật'}
              </Text>
            </View>
            {item.bookedBy && (
              <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 4, fontStyle: 'italic' }]}>Lock bởi: {item.bookedBy}</Text>
            )}
          </View>

          <View style={styles.productFooter}>
            {item.status === 'AVAILABLE' && (
              <SGButton title={lockMutation.isPending ? '...' : 'Lock Căn'} size="sm" variant="outline" style={{ flex: 1, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }}
                onPress={() => handleLock(item.id, item.code)} disabled={lockMutation.isPending}
                icon={<Lock size={14} color={isDark ? '#E2E8F0' : '#475569'} />} />
            )}
            {item.status === 'LOCKED' && (
              <SGButton title={unlockMutation.isPending ? '...' : 'Mở Lock'} size="sm" variant="outline" style={{ flex: 1, borderColor: '#f59e0b' }}
                onPress={() => handleUnlock(item.id, item.code)} disabled={unlockMutation.isPending}
                icon={<Unlock size={14} color="#f59e0b" />} />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {selectedProjectId && (
        <ProductFormModal visible={showProductForm} onClose={handleCloseForm} projectId={selectedProjectId} editData={editingProduct} />
      )}
      <DeleteConfirmModal visible={!!deletingProduct} onClose={() => setDeletingProduct(null)} onConfirm={handleDelete}
        message={`Xóa sản phẩm "${deletingProduct?.code}"? Không thể hoàn tác.`} isLoading={deleteMutation.isPending} />

      {/* Aurora Backdrop */}
      {Platform.OS === 'web' && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 0, overflow: 'hidden' }]} pointerEvents="none">
          <View style={{
            position: 'absolute', top: '5%', right: '-8%', width: 500, height: 500,
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.03)' : 'rgba(16, 185, 129, 0.02)',
            borderRadius: 250,
          } as any} />
          <View style={{
            position: 'absolute', bottom: '15%', left: '-5%', width: 400, height: 400,
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.03)' : 'rgba(59, 130, 246, 0.02)',
            borderRadius: 200,
          } as any} />
        </View>
      )}

      {/* Header */}
      <View style={[styles.header, { zIndex: 1 }]}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h1, { color: colors.text, marginBottom: 8, fontWeight: '800', letterSpacing: -0.5 }]}>Quản lý Bảng hàng</Text>
          <Text style={[typography.body, { color: colors.textSecondary, fontSize: 15 }]}>
            Theo dõi trạng thái, khóa căn và quản lý rổ hàng dự án
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <SGButton title="Import CSV" variant="outline" icon={<Upload size={16} color={isDark ? '#E2E8F0' : '#475569'} />}
            onPress={() => setShowBatchInput(!showBatchInput)} disabled={!selectedProjectId} 
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }} />
          <SGButton title="Xuất CSV" variant="outline" icon={<Download size={16} color={isDark ? '#E2E8F0' : '#475569'} />}
            onPress={handleExportCSV} disabled={!selectedProjectId} 
            style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }} />
          <SGButton title="Thêm SP" icon={<Plus size={20} color="#fff" />}
            onPress={() => { setEditingProduct(null); setShowProductForm(true); }} disabled={!selectedProjectId}
            style={{ backgroundColor: '#10b981' }} />
        </View>
      </View>

      {/* Batch Import Panel */}
      {showBatchInput && (
        <View style={[styles.batchPanel, isDark ? styles.glassCardDark : styles.glassCardLight, Platform.OS === 'web' && styles.glassEffect as any, { zIndex: 1 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={[typography.h4, { color: colors.text, fontWeight: '800' }]}>Import hàng loạt (CSV)</Text>
            <TouchableOpacity onPress={() => setShowBatchInput(false)} style={[styles.miniBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }]}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[typography.micro, { color: colors.textTertiary, marginBottom: 14, fontWeight: '500' }]}>
            Mỗi dòng 1 sản phẩm, format: mã_căn, block, tầng, diện_tích, giá, phòng_ngủ, hướng
          </Text>
          <TextInput
            multiline numberOfLines={5}
            value={batchCSV}
            onChangeText={setBatchCSV}
            placeholder={'A1-0301, A1, 3, 65.5, 3.2, 2, Đông Nam\nA1-0302, A1, 3, 72.0, 3.5, 2, Tây'}
            placeholderTextColor={colors.textTertiary}
            style={[styles.batchInput, {
              color: colors.text,
              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f8fafc',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            }]}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 14, gap: 10 }}>
            <SGButton title="Hủy" variant="outline" onPress={() => { setShowBatchInput(false); setBatchCSV(''); }}
              style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' }} />
            <SGButton title={`Import ${batchCSV.trim().split('\n').filter(Boolean).length} dòng`} onPress={handleBatchImport}
              disabled={!batchCSV.trim()} style={{ backgroundColor: '#10b981' }} />
          </View>
        </View>
      )}

      {/* Project Selector */}
      <View style={{ marginBottom: 24, zIndex: 1 }}>
        <Text style={[typography.micro, { color: colors.textTertiary, marginBottom: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }]}>Chọn Dự án</Text>
        {projectsLoading ? <ActivityIndicator size="small" color="#10b981" /> : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {(Array.isArray(projects) ? projects : []).map((p: any) => (
              <TouchableOpacity key={p.id} onPress={() => setSelectedProjectId(p.id)}
                style={[styles.projectTab, {
                  backgroundColor: selectedProjectId === p.id ? '#10b981' : (isDark ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.85)'),
                  borderColor: selectedProjectId === p.id ? '#10b981' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                  ...(Platform.OS === 'web' && selectedProjectId === p.id && { boxShadow: '0 4px 16px rgba(16, 185, 129, 0.25)' } as any),
                }]}>
                <Text style={[typography.body, { color: selectedProjectId === p.id ? '#fff' : colors.text, fontWeight: '700', fontSize: 13 }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Search + Status Filter Row */}
      <View style={{ flexDirection: 'row', gap: 14, marginBottom: 24, alignItems: 'center', zIndex: 1 }}>
        <View style={[styles.searchBox, { 
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)', 
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          flex: 1 
        }]}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, outlineStyle: 'none' as any }]}
            placeholder="Tìm mã căn, block, tầng..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={14} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {STATUS_FILTERS.map(f => {
            const isActive = statusFilter === f.value;
            const chipColor = f.value ? getStatusColor(f.value) : '#10b981';
            return (
              <TouchableOpacity key={f.value || 'all'} onPress={() => setStatusFilter(f.value)}
                style={[styles.filterChip, {
                  backgroundColor: isActive ? chipColor : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.85)'),
                  borderColor: isActive ? chipColor : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                  ...(Platform.OS === 'web' && isActive && { boxShadow: `0 3px 12px ${chipColor}40` } as any),
                }]}>
                {!isActive && f.value && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: chipColor, marginRight: 6 }} />}
                <Text style={{ color: isActive ? '#fff' : colors.text, fontSize: 12, fontWeight: '700' }}>{f.label}</Text>
                <View style={{ 
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                  paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6
                }}>
                  <Text style={{ color: isActive ? '#fff' : colors.textSecondary, fontSize: 10, fontWeight: '800' }}>{f.count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid Section */}
      <View style={[styles.gridSection, isDark ? styles.glassCardDark : styles.glassCardLight, Platform.OS === 'web' && styles.glassEffect as any, { zIndex: 1 }]}>
        <View style={styles.toolbar}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={[styles.toolbarIcon, { backgroundColor: isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5' }]}>
              <Package size={18} color="#10b981" />
            </View>
            <View>
              <Text style={[typography.h4, { color: colors.text, fontWeight: '800' }]}>
                Bảng hàng {selectedProject?.name || ''}
              </Text>
              {filteredProducts.length > 0 && (
                <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 2 }]}>{filteredProducts.length} sản phẩm</Text>
              )}
            </View>
          </View>
        </View>

        {productsLoading ? (
          <View style={styles.centerContainer}><ActivityIndicator size="large" color="#10b981" /></View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.centerContainer}>
            <Grid3x3 size={56} color={colors.textTertiary} opacity={0.3} style={{ marginBottom: 20 }} />
            <Text style={[typography.h4, { color: colors.textSecondary, fontWeight: '800' }]}>
              {searchQuery ? `Không tìm thấy "${searchQuery}"` : statusFilter ? 'Không có sản phẩm với trạng thái này' : 'Chưa có sản phẩm nào'}
            </Text>
            <Text style={[typography.body, { color: colors.textTertiary, marginTop: 8 }]}>
              {!searchQuery && !statusFilter && 'Bấm "Thêm SP" hoặc "Import CSV" để bắt đầu.'}
            </Text>
          </View>
        ) : (
          <FlatList data={filteredProducts} keyExtractor={item => item.id} renderItem={renderProductItem}
            numColumns={NUM_COLUMNS} key={`grid-${NUM_COLUMNS}`}
            columnWrapperStyle={{ gap: 20 }} contentContainerStyle={{ gap: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: isDesktop ? 40 : 20, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  projectTab: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  filterChip: { 
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 
  },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  toolbarIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  
  productCard: { flex: 1, borderRadius: 16, overflow: 'hidden', minHeight: 220 },
  productInner: { padding: 18, flex: 1 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { 
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 
  },
  productBody: { flex: 1 },
  productInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  priceRow: { borderTopWidth: 1, paddingTop: 12, marginTop: 10 },
  productFooter: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300 },
  miniBtn: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 46, 
    borderRadius: 12, maxWidth: 360, borderWidth: 1 
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, height: '100%', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif", fontWeight: '500' },
  
  batchPanel: { padding: 24, borderRadius: 20, marginBottom: 24 },
  batchInput: { 
    borderWidth: 1, borderRadius: 14, padding: 16, fontSize: 13, minHeight: 110, textAlignVertical: 'top',
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" 
  },
  
  gridSection: { flex: 1, padding: 28, borderRadius: 20 },
  
  glassEffect: {
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      transition: 'transform 0.2s, box-shadow 0.2s',
    } as any),
  },
  glassCardDark: { 
    backgroundColor: 'rgba(30, 41, 59, 0.65)', 
    borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1,
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' } as any),
  },
  glassCardLight: { 
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    borderColor: 'rgba(0, 0, 0, 0.04)', borderWidth: 1,
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)' } as any),
  },
});
