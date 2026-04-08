import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography, useTheme } from '@sgroup/ui/src/theme/theme';
import { SGCard, SGTable, SGButton, SGInput, SGSelect, SGModal } from '@sgroup/ui/src/ui/components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { legalApi } from '../api/legalApi';
import { format } from 'date-fns';

export function ProjectDocsScreen({ userRole }: { userRole: string }) {
  const colors = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    docType: '1/500',
    status: 'VALID',
    projectId: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['projectDocs', search, filterType],
    queryFn: async () => {
      try {
        const res = await legalApi.getProjectDocs('ALL', { search, type: filterType !== 'ALL' ? filterType : undefined });
        return res.data;
      } catch (e) {
        return [];
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => legalApi.deleteProjectDoc(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projectDocs'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingDoc) {
        return legalApi.updateProjectDoc(editingDoc.id, data);
      }
      return legalApi.createProjectDoc(data.projectId || 'NEW_PROJECT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectDocs'] });
      setModalVisible(false);
    },
  });

  const columns = [
    { key: 'name', title: 'Tên hồ sơ' },
    { key: 'docType', title: 'Loại', render: (val: string) => <Text style={{color: colors.brand}}>{val}</Text> },
    { key: 'status', title: 'Trạng thái' },
    { 
      key: 'issuedDate', 
      title: 'Ngày cấp',
      render: (val: any) => <Text style={{color: colors.textSecondary}}>{val ? format(new Date(val), 'dd/MM/yyyy') : '---'}</Text>
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
        <Text style={[typography.h3, { color: colors.text }]}>Hồ sơ dự án</Text>
        <SGButton title="Thêm Hồ Sơ" onPress={() => { setEditingDoc(null); setFormData({ name: '', docType: '1/500', status: 'VALID', projectId: '' }); setModalVisible(true); }} />
      </View>

      <View style={styles.filters}>
        <View style={{ flex: 1, maxWidth: 300 }}>
          <SGInput placeholder="Tìm kiếm tên hồ sơ..." value={search} onChangeText={setSearch} />
        </View>
        <View style={{ width: 150 }}>
          <SGSelect 
            value={filterType} 
            onChange={setFilterType}
            options={[
              { label: 'Tất cả loại', value: 'ALL' },
              { label: 'Quy hoạch (1/500)', value: '1/500' },
              { label: 'Giấy phép (GPXD)', value: 'GPXD' }
            ]} 
          />
        </View>
      </View>

      <SGCard style={styles.card}>
        <SGTable 
          columns={columns} 
          data={data || []}
          loading={isLoading}
          emptyText="Chưa có hồ sơ dự án nào."
        />
      </SGCard>

      <SGModal
        visible={isModalVisible}
        title={editingDoc ? "Cập nhật hồ sơ" : "Thêm hồ sơ mới"}
        onClose={() => setModalVisible(false)}
      >
        <SGInput label="Tên hồ sơ / Quyết định" value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} />
        <SGInput label="Project ID (Mã dự án)" value={formData.projectId} onChangeText={(t) => setFormData({...formData, projectId: t})} />
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
  card: { flex: 1, padding: 16 }
});
