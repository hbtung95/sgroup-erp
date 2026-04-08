import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { typography, useTheme } from '@sgroup/ui/src/theme/theme';
import { SGCard, SGTable, SGButton, SGInput, SGSelect, SGModal } from '@sgroup/ui/src/ui/components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { legalApi } from '../api/legalApi';
import { format } from 'date-fns';

export function TransactionDocsScreen({ userRole }: { userRole: string }) {
  const colors = useTheme();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  
  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    docType: 'CONTRACT',
    status: 'PENDING',
    dealId: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['transactionDocs', search, filterType],
    queryFn: async () => {
      // In a real app we would pass dealId to filter, here we assume admin views all if dealId is omitted or we fetch all.
      // Modifying legalApi to accept a global 'deals/all/docs' or using generic params.
      // For this mockup, we'll fetch from a generic endpoint if it existed, or mock the search.
      try {
        // Assume API has been patched to support getting all docs if admin, or we just pass a hardcoded dealId for demo
        const res = await legalApi.getTransactionDocs('ALL', { search, type: filterType !== 'ALL' ? filterType : undefined });
        return res.data;
      } catch (e) {
        return [];
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => legalApi.deleteTransactionDoc(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactionDocs'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingDoc) {
        return legalApi.updateTransactionDoc(editingDoc.id, data);
      }
      return legalApi.createTransactionDoc(data.dealId || 'NEW_DEAL', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactionDocs'] });
      setModalVisible(false);
    },
  });

  const columns = [
    { key: 'name', title: 'Tên hồ sơ / Mã HĐ' },
    { key: 'docType', title: 'Loại', render: (val: string) => <Text style={{color: colors.brand}}>{val}</Text> },
    { key: 'status', title: 'Trạng thái' },
    { 
      key: 'signedDate', 
      title: 'Ngày ký',
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
        <Text style={[typography.h3, { color: colors.text }]}>Hồ sơ giao dịch</Text>
        <SGButton title="Thêm Hồ Sơ" onPress={() => { setEditingDoc(null); setFormData({ name: '', docType: 'CONTRACT', status: 'PENDING', dealId: '' }); setModalVisible(true); }} />
      </View>

      <View style={styles.filters}>
        <View style={{ flex: 1, maxWidth: 300 }}>
          <SGInput placeholder="Tìm kiếm mã hợp đồng..." value={search} onChangeText={setSearch} />
        </View>
        <View style={{ width: 150 }}>
          <SGSelect 
            value={filterType} 
            onChange={setFilterType}
            options={[
              { label: 'Tất cả loại', value: 'ALL' },
              { label: 'Hợp đồng', value: 'CONTRACT' },
              { label: 'Hồ sơ KYC', value: 'KYC' }
            ]} 
          />
        </View>
      </View>

      <SGCard style={styles.card}>
        <SGTable 
          columns={columns} 
          data={data || []}
          loading={isLoading}
          emptyText="Chưa có hồ sơ giao dịch nào."
        />
      </SGCard>

      <SGModal
        visible={isModalVisible}
        title={editingDoc ? "Cập nhật hồ sơ" : "Thêm hồ sơ mới"}
        onClose={() => setModalVisible(false)}
      >
        <SGInput label="Tên hồ sơ / Mã HĐ" value={formData.name} onChangeText={(t) => setFormData({...formData, name: t})} />
        <SGInput label="Deal ID (Mã giao dịch)" value={formData.dealId} onChangeText={(t) => setFormData({...formData, dealId: t})} />
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
