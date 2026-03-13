import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { typography, useTheme } from '../../../shared/theme/theme';
import { useThemeStore } from '../../../shared/theme/themeStore';
import { SGCard, SGButton } from '../../../shared/ui/components';
import { useProjects, useProjectProducts, useLockProduct, useUnlockProduct, useDeleteProduct } from '../hooks/useProjects';
import { Grid3x3, Lock, Unlock, Plus, Edit2, Trash2, Search, Download, Upload, X } from 'lucide-react-native';
import { ProductFormModal } from '../components/ProductFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { useAuthStore } from '../../auth/store/authStore';
import { useToast } from '../../sales/components/ToastProvider';

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
      await lockMutation.mutateAsync({ id: productId, staffName: user?.name || 'Unknown' });
      showToast(`Đã lock căn ${code}`, 'success');
    } catch (e: any) {
      showToast(e?.response?.data?.message || `Lock ${code} thất bại`, 'error');
    }
  };
  const handleUnlock = async (productId: string, code: string) => {
    try {
      await unlockMutation.mutateAsync(productId);
      showToast(`Đã mở lock căn ${code}`, 'success');
    } catch (e: any) {
      showToast(e?.response?.data?.message || `Unlock ${code} thất bại`, 'error');
    }
  };
  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      await deleteMutation.mutateAsync(deletingProduct.id);
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
    const headers = 'Mã Căn,Block,Tầng,Diện tích,Giá (Tỷ),Phòng ngủ,Hướng,Trạng thái,Người Lock\n';
    const rows = safeProducts.map((p: any) =>
      `${p.code},${p.block || ''},${p.floor || ''},${p.area || ''},${p.price || ''},${p.bedrooms || ''},${p.direction || ''},${p.status},${p.bookedBy || ''}`
    ).join('\n');
    const csv = '\uFEFF' + headers + rows; // BOM for Excel UTF-8
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
      const lines = batchCSV.trim().split('\n').filter(l => l.trim());
      const items = lines.map(line => {
        const [code, block, floor, area, price, bedrooms, direction] = line.split(',').map(s => s.trim());
        return {
          projectId: selectedProjectId!,
          code,
          block: block || undefined,
          floor: parseInt(floor) || 0,
          area: parseFloat(area) || 0,
          price: parseFloat(price) || 0,
          bedrooms: parseInt(bedrooms) || 0,
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
    { value: null, label: 'Tất cả' }, { value: 'AVAILABLE', label: 'Sẵn sàng' },
    { value: 'LOCKED', label: 'Đang Lock' }, { value: 'BOOKED', label: 'Đã đặt chỗ' },
    { value: 'SOLD', label: 'Đã bán' },
  ];

  const renderProductItem = ({ item }: { item: any }) => {
    const sc = getStatusColor(item.status);
    return (
      <View style={[styles.productCard, {
        backgroundColor: isDark ? 'rgba(30,41,59,0.5)' : '#fff',
        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        borderTopColor: sc, borderTopWidth: 3,
      }]}>
        <View style={styles.productHeader}>
          <Text style={[typography.h4, { color: colors.text }]}>{item.code}</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.miniBtn}>
              <Edit2 size={13} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeletingProduct(item)} style={styles.miniBtn}>
              <Trash2 size={13} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: `${sc}20`, alignSelf: 'flex-start', marginBottom: 10 }]}>
          <Text style={[typography.micro, { color: sc, fontWeight: '700' }]}>{getStatusLabel(item.status)}</Text>
        </View>
        <View style={styles.productBody}>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            {item.block ? `${item.block} • ` : ''}Tầng {item.floor} • {item.bedrooms} PN
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>DT: {item.area} m²</Text>
          {item.direction && <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>Hướng: {item.direction}</Text>}
          <Text style={[typography.body, { color: colors.text, marginTop: 8, fontWeight: '700' }]}>
            {item.price ? `${item.price.toLocaleString('vi-VN')} Tỷ` : 'Đang cập nhật'}
          </Text>
          {item.bookedBy && <Text style={[typography.micro, { color: colors.textTertiary, marginTop: 6 }]}>Bởi: {item.bookedBy}</Text>}
        </View>
        <View style={styles.productFooter}>
          {item.status === 'AVAILABLE' && (
            <SGButton title={lockMutation.isPending ? '...' : 'Lock Căn'} size="sm" variant="outline" style={{ flex: 1 }}
              onPress={() => handleLock(item.id, item.code)} disabled={lockMutation.isPending}
              icon={<Lock size={14} color={isDark ? '#E2E8F0' : '#475569'} />} />
          )}
          {item.status === 'LOCKED' && (
            <SGButton title={unlockMutation.isPending ? '...' : 'Mở Lock'} size="sm" variant="outline" style={{ flex: 1 }}
              onPress={() => handleUnlock(item.id, item.code)} disabled={unlockMutation.isPending}
              icon={<Unlock size={14} color={isDark ? '#E2E8F0' : '#475569'} />} />
          )}
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

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[typography.h2, { color: colors.text, marginBottom: 8 }]}>Quản lý Bảng hàng</Text>
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Theo dõi trạng thái, khóa căn và quản lý sản phẩm dự án
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <SGButton title="Import CSV" variant="outline" icon={<Upload size={16} color={isDark ? '#E2E8F0' : '#475569'} />}
            onPress={() => setShowBatchInput(!showBatchInput)} disabled={!selectedProjectId} />
          <SGButton title="Xuất CSV" variant="outline" icon={<Download size={16} color={isDark ? '#E2E8F0' : '#475569'} />}
            onPress={handleExportCSV} disabled={!selectedProjectId} />
          <SGButton title="Thêm SP" icon={<Plus size={20} color="#fff" />}
            onPress={() => { setEditingProduct(null); setShowProductForm(true); }} disabled={!selectedProjectId} />
        </View>
      </View>

      {/* Batch Import Panel */}
      {showBatchInput && (
        <SGCard style={{ padding: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={[typography.h4, { color: colors.text }]}>Import hàng loạt (CSV)</Text>
            <TouchableOpacity onPress={() => setShowBatchInput(false)}><X size={18} color={colors.textSecondary} /></TouchableOpacity>
          </View>
          <Text style={[typography.micro, { color: colors.textSecondary, marginBottom: 12 }]}>
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
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
            }]}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 }}>
            <SGButton title="Hủy" variant="outline" onPress={() => { setShowBatchInput(false); setBatchCSV(''); }} />
            <SGButton title={`Import ${batchCSV.trim().split('\n').filter(Boolean).length} dòng`} onPress={handleBatchImport}
              disabled={!batchCSV.trim()} />
          </View>
        </SGCard>
      )}

      {/* Project Selector */}
      <View style={{ marginBottom: 20 }}>
        <Text style={[typography.body, { color: colors.textSecondary, marginBottom: 10, fontWeight: '700' }]}>Chọn Dự án:</Text>
        {projectsLoading ? <ActivityIndicator size="small" color="#10b981" /> : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {(Array.isArray(projects) ? projects : []).map((p: any) => (
              <TouchableOpacity key={p.id} onPress={() => setSelectedProjectId(p.id)}
                style={[styles.projectTab, {
                  backgroundColor: selectedProjectId === p.id ? '#10b981' : (isDark ? 'rgba(30,41,59,0.8)' : '#fff'),
                  borderColor: selectedProjectId === p.id ? '#10b981' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                }]}>
                <Text style={[typography.body, { color: selectedProjectId === p.id ? '#fff' : colors.text, fontWeight: '600' }]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Search + Status Filter Row */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <View style={[styles.searchBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', flex: 1 }]}>
          <Search size={18} color={colors.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text, outlineStyle: 'none' as any }]}
            placeholder="Tìm mã căn, block, tầng..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}><X size={14} color={colors.textTertiary} /></TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {STATUS_FILTERS.map(f => (
            <TouchableOpacity key={f.value || 'all'} onPress={() => setStatusFilter(f.value)}
              style={[styles.filterChip, {
                backgroundColor: statusFilter === f.value ? (f.value ? getStatusColor(f.value) : '#10b981') : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                borderColor: statusFilter === f.value ? (f.value ? getStatusColor(f.value) : '#10b981') : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
              }]}>
              <Text style={{ color: statusFilter === f.value ? '#fff' : colors.text, fontSize: 12, fontWeight: '700' }}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Grid */}
      <SGCard style={{ flex: 1, padding: 24 }}>
        <View style={styles.toolbar}>
          <Text style={[typography.h4, { color: colors.text }]}>
            Bảng hàng {(Array.isArray(projects) ? projects : []).find((p: any) => p.id === selectedProjectId)?.name || ''}
            {filteredProducts.length > 0 && <Text style={[typography.body, { color: colors.textSecondary }]}> ({filteredProducts.length} sản phẩm)</Text>}
          </Text>
        </View>

        {productsLoading ? (
          <View style={styles.centerContainer}><ActivityIndicator size="large" color="#10b981" /></View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.centerContainer}>
            <Grid3x3 size={48} color={colors.textTertiary} opacity={0.5} style={{ marginBottom: 16 }} />
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              {searchQuery ? `Không tìm thấy "${searchQuery}"` : statusFilter ? 'Không có sản phẩm với trạng thái này' : 'Chưa có sản phẩm nào'}
            </Text>
          </View>
        ) : (
          <FlatList data={filteredProducts} keyExtractor={item => item.id} renderItem={renderProductItem}
            numColumns={4} columnWrapperStyle={{ gap: 16 }} contentContainerStyle={{ gap: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false} />
        )}
      </SGCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  projectTab: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  toolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  productCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 16, minHeight: 160 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  productBody: { flex: 1 },
  productFooter: { marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  miniBtn: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(150,150,150,0.08)' },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 40, borderRadius: 10, maxWidth: 320 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, height: '100%', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" },
  batchInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 13, minHeight: 100, textAlignVertical: 'top',
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" },
});
