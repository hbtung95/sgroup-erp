import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Platform } from 'react-native';
import { typography, sgds } from '@sgroup/ui/src/theme/theme';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { SGButton } from '@sgroup/ui/src/ui/components';
import { X, AlertCircle } from 'lucide-react-native';
import { useCreateProduct, useUpdateProduct } from '../../application/hooks/useProjects';
import { PropertyProduct } from '../../domain/models';
import { useToast } from '../../../sales/components/ToastProvider';

interface Props {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  editData?: PropertyProduct | null;
}

const DIRECTIONS = ['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc'];
const PRODUCT_STATUSES = [
  { value: 'AVAILABLE', label: 'Sẵn sàng' },
  { value: 'LOCKED', label: 'Đang Lock' },
  { value: 'BOOKED', label: 'Đã đặt chỗ' },
  { value: 'PENDING_DEPOSIT', label: 'Chờ cọc' },
  { value: 'DEPOSIT', label: 'Đã cọc' },
  { value: 'SOLD', label: 'Đã bán' },
  { value: 'COMPLETED', label: 'Hoàn tất' },
];

export function ProductFormModal({ visible, onClose, projectId, editData }: Props) {
  const { colors, theme, isDark } = useAppTheme();
  const { showToast } = useToast();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isEdit = !!editData;

  const [form, setForm] = useState({
    code: '', block: '', floor: '', area: '', price: '',
    direction: '', bedrooms: '', status: 'AVAILABLE', note: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (editData) {
      setForm({
        code: editData.code || '',
        block: editData.block || '',
        floor: editData.floor?.toString() || '',
        area: editData.area?.toString() || '',
        price: editData.price?.toString() || '',
        direction: editData.direction || '',
        bedrooms: editData.bedrooms?.toString() || '',
        status: editData.status || 'AVAILABLE',
        note: editData.note || '',
      });
    } else {
      setForm({
        code: '', block: '', floor: '', area: '', price: '',
        direction: '', bedrooms: '', status: 'AVAILABLE', note: '',
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [editData, visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.code.trim()) newErrors.code = 'Mã căn bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);

    const payload: Partial<PropertyProduct> = {
      code: form.code.trim(),
      block: form.block.trim() || undefined,
      floor: parseInt(form.floor) || 0,
      area: parseFloat(form.area) || 0,
      price: parseFloat(form.price) || 0,
      direction: form.direction || undefined,
      bedrooms: parseInt(form.bedrooms) || 0,
      status: form.status,
      note: form.note.trim() || undefined,
    };

    try {
      if (isEdit && editData) {
        await updateMutation.mutateAsync({ projectId, id: editData.id, data: payload });
        showToast(`Đã cập nhật sản phẩm "${form.code}"`, 'success');
      } else {
        await createMutation.mutateAsync({ projectId, data: payload });
        showToast(`Đã thêm sản phẩm "${form.code}" thành công!`, 'success');
      }
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Lỗi không xác định';
      setSubmitError(msg);
      showToast(`Thất bại: ${msg}`, 'error');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const renderField = (label: string, key: string, opts?: { multiline?: boolean; placeholder?: string }) => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, {
          color: colors.text,
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
          borderColor: errors[key] ? colors.danger : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
          ...(opts?.multiline ? { height: 80, textAlignVertical: 'top' } : {}),
        }]}
        value={(form as any)[key]}
        onChangeText={(v) => setForm(prev => ({ ...prev, [key]: v }))}
        placeholder={opts?.placeholder || ''}
        placeholderTextColor={colors.textTertiary}
        multiline={opts?.multiline}
      />
      {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
    </View>
  );

  const renderChips = (label: string, key: string, options: string[]) => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => setForm(prev => ({ ...prev, [key]: (prev as any)[key] === opt ? '' : opt }))}
            style={[styles.chip, {
              backgroundColor: (form as any)[key] === opt ? colors.success : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
              borderColor: (form as any)[key] === opt ? colors.success : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
            }]}
          >
            <Text style={{
              color: (form as any)[key] === opt ? '#fff' : colors.text,
              fontSize: 13, fontWeight: '600',
            }}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const content = (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)', ...(Platform.OS === 'web' ? { backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' } : {}) } as any]}>
      <View style={[styles.modal, {
        backgroundColor: isDark ? colors.bgElevated : '#fff',
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        ...(Platform.OS === 'web' ? sgds.glass : {}),
      } as any]}>
        <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }]}>
          <Text style={[typography.h3, { color: colors.text }]}>
            {isEdit ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
          {submitError && (
            <View style={[styles.errorBanner, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2' }]}>
              <AlertCircle size={16} color={colors.danger} />
              <Text style={{ color: colors.danger, fontSize: 13, fontWeight: '600', marginLeft: 8, flex: 1 }}>{submitError}</Text>
              <TouchableOpacity onPress={() => setSubmitError(null)}>
                <X size={14} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>{renderField('Mã Căn *', 'code', { placeholder: 'VD: A1-0201' })}</View>
            <View style={{ flex: 1 }}>{renderField('Block / Tòa', 'block', { placeholder: 'VD: A1' })}</View>
          </View>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>{renderField('Tầng', 'floor', { placeholder: '2' })}</View>
            <View style={{ flex: 1 }}>{renderField('Diện tích (m²)', 'area', { placeholder: '65.5' })}</View>
            <View style={{ flex: 1 }}>{renderField('Số phòng ngủ', 'bedrooms', { placeholder: '2' })}</View>
          </View>

          {renderField('Giá bán (Tỷ VND)', 'price', { placeholder: '3.5' })}
          {renderChips('Hướng', 'direction', DIRECTIONS)}

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>TRẠNG THÁI</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {PRODUCT_STATUSES.map(s => (
                <TouchableOpacity
                  key={s.value}
                  onPress={() => setForm(prev => ({ ...prev, status: s.value }))}
                  style={[styles.chip, {
                    backgroundColor: form.status === s.value ? colors.success : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
                    borderColor: form.status === s.value ? colors.success : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
                  }]}
                >
                  <Text style={{
                    color: form.status === s.value ? '#fff' : colors.text,
                    fontSize: 13, fontWeight: '600',
                  }}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {renderField('Ghi chú', 'note', { multiline: true, placeholder: 'Ghi chú thêm...' })}
        </ScrollView>

        <View style={[styles.modalFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }]}>
          <SGButton title="Hủy" variant="outline" onPress={onClose} style={{ marginRight: 12 }} />
          <SGButton
            title={isLoading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Thêm Sản phẩm')}
            onPress={handleSubmit}
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    if (!visible) return null;
    return content;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center', zIndex: 9999,
    ...(Platform.OS === 'web' ? { position: 'fixed' } as any : {}),
  },
  modal: {
    width: '90%', maxWidth: 640, maxHeight: '85%',
    borderRadius: 20, borderWidth: 1, overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 24px 80px rgba(0,0,0,0.3)' } as any : { elevation: 20 }),
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 24, paddingBottom: 20, borderBottomWidth: 1,
  },
  closeBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20, borderTopWidth: 1 },
  fieldGroup: { marginBottom: 20 },
  label: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase',
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  },
  input: {
    height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, fontSize: 14,
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4, fontWeight: '600' }, // static style - colors.danger used inline
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12,
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
  },
});
