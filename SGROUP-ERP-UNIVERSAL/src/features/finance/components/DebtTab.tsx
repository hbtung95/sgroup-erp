import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFinanceDebts } from '../hooks/useFinance';

export const DebtTab = () => {
  const [debtType, setDebtType] = useState<string>('RECEIVABLE_CUSTOMER');
  const { data: debtsData, isLoading } = useFinanceDebts({ debtType, limit: 10 });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const debts = Array.isArray(debtsData?.data) ? debtsData.data : [];

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterBtn, debtType === 'RECEIVABLE_CUSTOMER' && styles.filterBtnActive]}
          onPress={() => setDebtType('RECEIVABLE_CUSTOMER')}
        >
          <Text style={[styles.filterText, debtType === 'RECEIVABLE_CUSTOMER' && styles.filterTextActive]}>Phải thu Khách hàng</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterBtn, debtType === 'RECEIVABLE_DEVELOPER' && styles.filterBtnActive]}
          onPress={() => setDebtType('RECEIVABLE_DEVELOPER')}
        >
          <Text style={[styles.filterText, debtType === 'RECEIVABLE_DEVELOPER' && styles.filterTextActive]}>Phải thu Chủ đầu tư</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterBtn, debtType === 'PAYABLE_STAFF' && styles.filterBtnActive]}
          onPress={() => setDebtType('PAYABLE_STAFF')}
        >
          <Text style={[styles.filterText, debtType === 'PAYABLE_STAFF' && styles.filterTextActive]}>Phải trả Nhân sự</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={debts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.debtCard}>
            <View style={styles.debtHeader}>
              <Text style={styles.debtCode}>{item.debtCode}</Text>
              <View style={[
                styles.statusBadge, 
                item.status === 'PAID' ? styles.statusPaid : styles.statusUnpaid
              ]}>
                <Text style={[
                  styles.statusText,
                  item.status === 'PAID' ? styles.textPaid : styles.textUnpaid
                ]}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.debtNote}>{item.note || 'Không có ghi chú'}</Text>
            
            <View style={styles.amountRow}>
              <View>
                <Text style={styles.amountLabel}>Tổng công nợ</Text>
                <Text style={styles.amountValue}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalAmount)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amountLabel}>Còn lại</Text>
                <Text style={[styles.amountValue, { color: '#DC2626' }]}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.remainingAmount)}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text>Không có công nợ nào</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBtnActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#BFDBFE',
  },
  filterText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  listContent: {
    gap: 12,
  },
  debtCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
  },
  debtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  debtCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  debtNote: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  amountLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusUnpaid: {
    backgroundColor: '#FEE2E2',
  },
  statusPaid: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textUnpaid: {
    color: '#DC2626',
  },
  textPaid: {
    color: '#16A34A',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  }
});
