import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Platform } from 'react-native';
import { typography, sgds } from '@sgroup/ui/src/theme/theme';
import { useAppTheme } from '@sgroup/ui/src/theme/useAppTheme';
import { SGButton } from '@sgroup/ui/src/ui/components';
import { X, AlertCircle } from 'lucide-react-native';
import { useCreateProject, useUpdateProject } from '../../application/hooks/useProjects';
import { DimProject } from '../../domain/models';
import { useToast } from '../../../sales/components/ToastProvider';

interface Props {
  visible: boolean;
  onClose: () => void;
  editData?: DimProject | null;
}

const PROJECT_TYPES = ['Chung cư', 'Biệt thự', 'Shophouse', 'Đất nền', 'Townhouse'];
const PROJECT_STATUSES = [
  { value: 'ACTIVE', label: 'Đang mở bán' },
  { value: 'PAUSED', label: 'Tạm dừng' },
  { value: 'CLOSED', label: 'Đã đóng' },
];

export function ProjectFormModal({ visible, onClose, editData }: Props) {
  const { colors, theme, isDark } = useAppTheme();
  const { showToast } = useToast();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const isEdit = !!editData;

  const [form, setForm] = useState({
    projectCode: '',
    name: '',
    developer: '',
    location: '',
    type: 'Chung cư',
    feeRate: '',
    avgPrice: '',
    totalUnits: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: '',
    note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (editData) {
      setForm({
        projectCode: editData.projectCode || '',
        name: editData.name || '',
        developer: editData.developer || '',
        location: editData.location || '',
        type: editData.type || 'Chung cư',
        feeRate: editData.feeRate?.toString() || '0',
        avgPrice: editData.avgPrice?.toString() || '0',
        totalUnits: editData.totalUnits?.toString() || '0',
        status: editData.status || 'ACTIVE',
        startDate: editData.startDate ? editData.startDate.split('T')[0] : '',
        endDate: editData.endDate ? editData.endDate.split('T')[0] : '',
        note: editData.note || '',
      });
    } else {
      setForm({
        projectCode: '', name: '', developer: '', location: '',
        type: 'Chung cư', feeRate: '', avgPrice: '', totalUnits: '',
        status: 'ACTIVE', startDate: '', endDate: '', note: '',
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [editData, visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.projectCode.trim()) newErrors.projectCode = 'Mã dự án bắt buộc';
    if (!form.name.trim()) newErrors.name = 'Tên dự án bắt buộc';
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);

    const payload: Partial<DimProject> = {
      projectCode: form.projectCode.trim(),
      name: form.name.trim(),
      developer: form.developer.trim() || undefined,
      location: form.location.trim() || undefined,
      type: form.type,
      feeRate: parseFloat(form.feeRate) || 0,
      avgPrice: parseFloat(form.avgPrice) || 0,
      totalUnits: parseInt(form.totalUnits) || 0,
      status: form.status,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      note: form.note.trim() || undefined,
    };

    try {
      if (isEdit && editData) {
        await updateMutation.mutateAsync({ id: editData.id, data: payload });
        showToast(`Đã cập nhật dự án "${form.name}"`, 'success');
      } else {
        await createMutation.mutateAsync(payload);
        showToast(`Đã tạo dự án "${form.name}" thành công!`, 'success');
      }
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Lỗi không xác định';
      setSubmitError(msg);
      showToast(`Thất bại: ${msg}`, 'error');
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const renderField = (label: string, key: string, opts?: { multiline?: boolean; placeholder?: string; type?: string }) => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[styles.input, {
          color: colors.text,
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
          borderColor: errors[key] ? '#ef4444' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
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

  const renderDropdown = (label: string, key: string, options: { value: string; label: string }[]) => (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setForm(prev => ({ ...prev, [key]: opt.value }))}
            style={[styles.chip, {
              backgroundColor: (form as any)[key] === opt.value
                ? '#10b981'
                : (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'),
              borderColor: (form as any)[key] === opt.value
                ? '#10b981'
                : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'),
            }]}
          >
            <Text style={{
              color: (form as any)[key] === opt.value ? '#fff' : colors.text,
              fontSize: 13, fontWeight: '600',
            }}>{opt.label}</Text>
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
        {/* Header */}
        <View style={[styles.modalHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }]}>
          <Text style={[typography.h3, { color: colors.text }]}>
            {isEdit ? 'Chỉnh sửa Dự án' : 'Thêm Dự án mới'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Body */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} showsVerticalScrollIndicator={false}>
          {/* Error Banner */}
          {submitError && (
            <View style={[styles.errorBanner, { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#fef2f2' }]}>
              <AlertCircle size={16} color="#ef4444" />
              <Text style={{ color: '#ef4444', fontSize: 13, fontWeight: '600', marginLeft: 8, flex: 1 }}>{submitError}</Text>
              <TouchableOpacity onPress={() => setSubmitError(null)}>
                <X size={14} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>{renderField('Mã Dự án *', 'projectCode', { placeholder: 'VD: DA001' })}</View>
            <View style={{ flex: 2 }}>{renderField('Tên Dự án *', 'name', { placeholder: 'VD: SG Center Tower' })}</View>
          </View>

          {renderField('Chủ đầu tư', 'developer', { placeholder: 'VD: SGROUP' })}
          {renderField('Vị trí', 'location', { placeholder: 'VD: Q7, TP.HCM' })}

          {renderDropdown('Loại hình', 'type', PROJECT_TYPES.map(t => ({ value: t, label: t })))}
          {renderDropdown('Trạng thái', 'status', PROJECT_STATUSES)}

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>{renderField('Phí MG (%)', 'feeRate', { placeholder: '2.5' })}</View>
            <View style={{ flex: 1 }}>{renderField('Giá TB (Tỷ)', 'avgPrice', { placeholder: '3.5' })}</View>
            <View style={{ flex: 1 }}>{renderField('Tổng SP', 'totalUnits', { placeholder: '500' })}</View>
          </View>

          {/* Date Fields */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1 }}>{renderField('Ngày mở bán', 'startDate', { placeholder: 'YYYY-MM-DD' })}</View>
            <View style={{ flex: 1 }}>{renderField('Ngày kết thúc', 'endDate', { placeholder: 'YYYY-MM-DD' })}</View>
          </View>

          {renderField('Ghi chú', 'note', { multiline: true, placeholder: 'Ghi chú thêm...' })}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.modalFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0' }]}>
          <SGButton title="Hủy" variant="outline" onPress={onClose} style={{ marginRight: 12 }} />
          <SGButton
            title={isLoading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo Dự án')}
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    ...(Platform.OS === 'web' ? { position: 'fixed' } as any : {}),
  },
  modal: {
    width: '90%',
    maxWidth: 680,
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { boxShadow: '0 24px 80px rgba(0,0,0,0.3)' } as any : { elevation: 20 }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    borderTopWidth: 1,
  },
  fieldGroup: { marginBottom: 20 },
  label: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.5,
    marginBottom: 8, textTransform: 'uppercase',
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  },
  input: {
    height: 44, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, fontSize: 14,
    fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1,
  },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4, fontWeight: '600' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
});
