import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Plus, ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react-native';
import { useFinanceTransactions, useFinanceAccounts } from '../hooks/useFinance';

export const CashflowTab = () => {
  const { data: accountsData, isLoading: accountsLoading } = useFinanceAccounts();
  const { data: txData, isLoading: txLoading } = useFinanceTransactions({ limit: 5 });

  if (accountsLoading || txLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const accounts = Array.isArray(accountsData) ? accountsData : [];
  const transactions = Array.isArray(txData?.data) ? txData.data : [];

  return (
    <View style={styles.container}>
      {/* Sổ quỹ - Accounts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sổ Quỹ</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Tạo Sổ</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={accounts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.accountCard}>
            <View style={styles.accountIconContainer}>
              <Wallet size={24} color="#3B82F6" />
            </View>
            <Text style={styles.accountName}>{item.accountName}</Text>
            <Text style={styles.accountBalance}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.currentBalance)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text>Chưa có sổ quỹ nào</Text>
          </View>
        }
        contentContainerStyle={styles.accountList}
      />

      {/* Giao dịch gần đây */}
      <View style={[styles.sectionHeader, { marginTop: 24 }]}>
        <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Tạo Phiếu</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionList}>
        {transactions.map((tx: any) => (
          <View key={tx.id} style={styles.transactionItem}>
            <View style={[
              styles.txIconContainer,
              { backgroundColor: tx.type === 'INCOME' ? '#DCFCE7' : '#FEE2E2' }
            ]}>
              {tx.type === 'INCOME' ? (
                <ArrowDownRight size={20} color="#16A34A" />
              ) : (
                <ArrowUpRight size={20} color="#DC2626" />
              )}
            </View>
            <View style={styles.txInfo}>
              <Text style={styles.txTitle}>{tx.note || (tx.type === 'INCOME' ? 'Thu tiền' : 'Chi tiền')}</Text>
              <Text style={styles.txSubtitle}>{tx.transactionCode} • {new Date(tx.createdAt).toLocaleDateString('vi-VN')}</Text>
            </View>
            <View style={styles.txAmountContainer}>
              <Text style={[
                styles.txAmount,
                { color: tx.type === 'INCOME' ? '#16A34A' : '#DC2626' }
              ]}>
                {tx.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(tx.amount)}
              </Text>
              <View style={[
                styles.statusBadge,
                tx.status === 'APPROVED' ? styles.statusApproved : styles.statusDraft
              ]}>
                <Text style={[
                  styles.statusText,
                  tx.status === 'APPROVED' ? styles.textApproved : styles.textDraft
                ]}>
                  {tx.status === 'APPROVED' ? 'Đã duyệt' : 'Chờ duyệt'}
                </Text>
              </View>
            </View>
          </View>
        ))}
        {transactions.length === 0 && (
          <View style={styles.emptyState}>
            <Text>Chưa có giao dịch nào</Text>
          </View>
        )}
      </View>
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
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  accountList: {
    gap: 16,
    paddingBottom: 8,
  },
  accountCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    width: 200,
  },
  accountIconContainer: {
    backgroundColor: '#DBEAFE',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  accountName: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  txSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  txAmountContainer: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusDraft: {
    backgroundColor: '#FEF3C7',
  },
  statusApproved: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  textDraft: {
    color: '#D97706',
  },
  textApproved: {
    color: '#16A34A',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  }
});
