import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography, useTheme } from '@sgroup/ui/src/theme/theme';
import { SGCard, SGTable, SGButton, SGInput, SGSelect, SGModal } from '@sgroup/ui/src/ui/components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { legalApi } from '../api/legalApi';

export function TemplatesScreen({ userRole }: { userRole: string }) {
  const colors = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    docType: 'CONTRACT',
    version: '1.0',
    isActive: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['legalTemplates', search, filterType],
    queryFn: async () => {
      try {
        const res = await legalApi.getTemplates({ search, type: filterType !== 'ALL' ? filterType : undefined });
        return res.data;
      } catch (e) {
        return [];
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => legalApi.deleteTemplate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['legalTemplates'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingDoc) {
        return legalApi.updateTemplate(editingDoc.id, data);
      }
      return legalApi.createTemplate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legalTemplates'] });
      setModalVisible(false);
    },
  });

  const columns = [
    { key: 'name', title: 'Tên biểu mẫu' },
    { key: 'docType', title: 'Loại', render: (val: string) => <Text style={{color: colors.brand}}>{val}</Text> },
    { key: 'version', title: 'Phiên bản', render: (val: string) => <Text style={{color: colors.textSecondary}}>{val}</Text> },
    { 
      key: 'isActive', 
      title: 'Hiệu lực',
      render: (val: boolean) => (
        <View style={[styles.badge, { backgroundColor: val ? '#D1FAE5' : '#FEE2E2' }]}>
          <Text style={{ color: val ? '#065F46' : '#991B1B', fontSize: 12, fontWeight: '600' }}>
            {val ? 'Đang áp dụng' : 'Khóa'}
          </Text>
        </View>
      )
    },
    {
      key: 'actions',
      title: '',
      render: (_: any, row: any) => (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => { setEditingDoc(row); setFormData(row); setModalVisible(true); }}>
            <Text style={{ color: colors.brand }}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteMutation.mutate(row.id)}>
            <Text style={{ color: colors.danger }}>Xóa</Text>
          </TouchableOpacity>
        </View>
      )
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[typography.h3, { color: colors.text }]}>Biểu mẫu chuẩn</Text>
        <SGButton title="Upload Biểu mẫu" onPress={() => { setEditingDoc(null); setFormData({ name: '', docType: 'CONTRACT', version: '1.0', isActive: true }); setModalVisible(true); }} />
      </View>

      <View style={styles.filters}>
        <View style={{ flex: 1, maxWidth: 300 }}>
          <SGInput placeholder="Tìm kiếm biểu mẫu..." value={search} onChangeText={setSearch} />
        </View>
        <View style={{ width: 150 }}>
          <SGSelect 
            value={filterType} 
            onChange={setFilterType}
            options={[
              { label: 'Tất cả', value: 'ALL' },
              { label: 'Hợp đồng', value: 'CONTRACT' },
              { label: 'Phụ lục', value: 'ADDENDUM' }
            ]} 
          />
        </View>
      </View>

      <SGCard style={styles.card}>
        <SGTable 
          columns={columns} 
          data={data || []}
          loading={isLoading}
          emptyText="Chưa có biểu mẫu nào."
        />
      </SGCard>

      <SGModal
        visible={isModalVisible}
        title={editingDoc ? "Cập nhật biểu mẫu" : "Thêm biểu mẫu mới"}
        onClose={() => setModalVisible(false)}
      >
        <SGInput label="Tên biểu mẫu" value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} />
        <SGInput label="Version" value={formData.version} onChangeText={(t) => setFormData({...formData, version: t})} />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
          <SGButton title="Lưu" onPress={() => saveMutation.mutate(formData)} loading={saveMutation.isPending} />
        </View>
      </SGModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filters: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  card: { flex: 1, padding: 16 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' }
});
