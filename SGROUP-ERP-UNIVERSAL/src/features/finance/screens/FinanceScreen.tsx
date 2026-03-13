import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FinanceErrorBoundary } from '../components/FinanceErrorBoundary';
import { FinanceLayout } from '../components/FinanceLayout';
import { CashflowTab } from '../components/CashflowTab';
import { DebtTab } from '../components/DebtTab';
import { useFinanceDashboard } from '../hooks/useFinance';

export function FinanceScreen() {
  const [activeTab, setActiveTab] = useState<'cashflow' | 'debt'>('cashflow');
  const { data: dashboardStats, isLoading } = useFinanceDashboard();

  return (
    <FinanceErrorBoundary>
      <FinanceLayout noScroll>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tài chính & Kế toán</Text>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'cashflow' && styles.tabButtonActive]}
              onPress={() => setActiveTab('cashflow')}
            >
              <Text style={[styles.tabText, activeTab === 'cashflow' && styles.tabTextActive]}>Dòng tiền</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'debt' && styles.tabButtonActive]}
              onPress={() => setActiveTab('debt')}
            >
              <Text style={[styles.tabText, activeTab === 'debt' && styles.tabTextActive]}>Công nợ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {activeTab === 'cashflow' ? (
            <CashflowTab />
          ) : (
            <DebtTab />
          )}
        </View>
      </FinanceLayout>
    </FinanceErrorBoundary>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    padding: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  }
});
