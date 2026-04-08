import { useState, useMemo, useCallback } from 'react';
import { useSalesStore, TransactionEntry } from '../store/useSalesStore';

export type DepositFilter = {
  search: string;
  statusFilter: 'ALL' | 'PENDING_DEPOSIT' | 'DEPOSIT';
};

const DEFAULT_FILTER: DepositFilter = {
  search: '',
  statusFilter: 'ALL',
};

export function useDepositData() {
  const transactions = useSalesStore(s => s.transactions);
  const units = useSalesStore(s => s.units);
  const approveDeposit = useSalesStore(s => s.approveDeposit);
  const cancelDeposit = useSalesStore(s => s.cancelDeposit);

  const [filter, setFilter] = useState<DepositFilter>(DEFAULT_FILTER);

  const updateFilter = useCallback((patch: Partial<DepositFilter>) => {
    setFilter(prev => ({ ...prev, ...patch }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilter(DEFAULT_FILTER);
  }, []);

  // Only deposit-related transactions
  const depositTransactions = useMemo(() => {
    return transactions.filter(
      t => t.status === 'PENDING_DEPOSIT' || t.status === 'DEPOSIT'
    );
  }, [transactions]);

  // Apply filters
  const filteredDeposits = useMemo(() => {
    return depositTransactions.filter(t => {
      if (filter.search) {
        const q = filter.search.toLowerCase();
        if (
          !t.unitCode.toLowerCase().includes(q) &&
          !t.customerName.toLowerCase().includes(q) &&
          !t.customerPhone.toLowerCase().includes(q) &&
          !t.project.toLowerCase().includes(q)
        ) return false;
      }
      if (filter.statusFilter !== 'ALL' && t.status !== filter.statusFilter) return false;
      return true;
    });
  }, [depositTransactions, filter]);

  // Stats
  const stats = useMemo(() => {
    const totalDeposits = depositTransactions.length;
    const pendingCount = depositTransactions.filter(t => t.status === 'PENDING_DEPOSIT').length;
    const confirmedCount = depositTransactions.filter(t => t.status === 'DEPOSIT').length;
    const totalValue = depositTransactions.reduce((sum, t) => sum + t.transactionValue, 0);
    return { totalDeposits, pendingCount, confirmedCount, totalValue };
  }, [depositTransactions]);

  // Find unit by unitCode for approve/cancel actions
  const findUnitIdByCode = useCallback((unitCode: string) => {
    const unit = units.find(u => u.code === unitCode);
    return unit?.id;
  }, [units]);

  const handleApprove = useCallback((unitCode: string) => {
    const unitId = findUnitIdByCode(unitCode);
    if (unitId) approveDeposit(unitId);
  }, [findUnitIdByCode, approveDeposit]);

  const handleCancel = useCallback((unitCode: string) => {
    const unitId = findUnitIdByCode(unitCode);
    if (unitId) cancelDeposit(unitId);
  }, [findUnitIdByCode, cancelDeposit]);

  return {
    deposits: filteredDeposits,
    allDeposits: depositTransactions,
    filter,
    updateFilter,
    resetFilter,
    stats,
    handleApprove,
    handleCancel,
  };
}
