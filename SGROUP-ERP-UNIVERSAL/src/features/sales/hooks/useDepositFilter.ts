import { useMemo, useState } from 'react';
import { useSalesStore } from '../store/useSalesStore';
import type { BookingPeriod } from './useBookingFilter';

export function useDepositFilter() {
  const transactions = useSalesStore(s => s.transactions);
  const [period, setPeriod] = useState<BookingPeriod>('MONTH');
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_DEPOSIT' | 'DEPOSIT' | 'REJECTED'>('ALL');

  const filteredData = useMemo(() => {
    // Only care about PENDING_DEPOSIT and DEPOSIT
    const allDeposits = transactions.filter(t => t.status === 'PENDING_DEPOSIT' || t.status === 'DEPOSIT');

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date(now);

    if (period === 'CUSTOM') {
      if (customFrom) startDate = new Date(customFrom);
      else { startDate.setDate(now.getDate() - 7); }
      startDate.setHours(0, 0, 0, 0);

      if (customTo) { endDate = new Date(customTo); endDate.setHours(23, 59, 59, 999); }
      else { endDate = new Date(); endDate.setHours(23, 59, 59, 999); }
    } else {
      switch (period) {
        case 'DAY':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'WEEK':
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'MONTH':
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'QUARTER': {
          const qm = Math.floor(now.getMonth() / 3) * 3;
          startDate.setMonth(qm, 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        }
        case 'YEAR':
          startDate.setMonth(0, 1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
      endDate.setHours(23, 59, 59, 999);
    }

    const validDeposits = transactions.filter(t => {
      const d = new Date(t.date);
      const inDateRange = d >= startDate && d <= endDate;
      if (!inDateRange) return false;
      
      // Determine validity based on statusFilter
      if (statusFilter === 'ALL') {
        // Show all transaction types that relate to deposits
        const validStatuses = ['PENDING_DEPOSIT', 'DEPOSIT', 'REJECTED'];
        return validStatuses.includes(t.status as string); 
      }
      
      return t.status === (statusFilter as any);
    });

    // Totals
    const totalDeposits = validDeposits.length;
    const pendingCount = validDeposits.filter(t => t.status === 'PENDING_DEPOSIT').length;
    const confirmedCount = validDeposits.filter(t => t.status === 'DEPOSIT').length;
    const totalValue = validDeposits.reduce((sum, t) => sum + (t.transactionValue || 0), 0);
    const confirmedValue = validDeposits.filter(t => t.status === 'DEPOSIT').reduce((sum, t) => sum + (t.transactionValue || 0), 0);

    const totals = {
      totalDeposits,
      pendingCount,
      confirmedCount,
      totalValue,
      confirmedValue,
    };

    // Chart data grouping (using value -> Tỷ VNĐ)
    const chartDataMap = new Map<string, { label: string; count: number; value: number }>();

    validDeposits.forEach(t => {
      const d = new Date(t.date);
      let key: string;
      let label: string;

      if (period === 'DAY') {
        key = `${d.getHours()}h`;
        label = `${d.getHours()}:00`;
      } else if (period === 'WEEK' || period === 'MONTH' || period === 'CUSTOM') {
        key = `${d.getDate()}/${d.getMonth() + 1}`;
        label = `${d.getDate()}/${d.getMonth() + 1}`;
      } else {
        key = `T${d.getMonth() + 1}`;
        label = `T${d.getMonth() + 1}`;
      }

      const existing = chartDataMap.get(key) || { label, count: 0, value: 0 };
      
      chartDataMap.set(key, {
        label,
        count: existing.count + 1,
        value: existing.value + (t.transactionValue || 0),
      });
    });

    if (chartDataMap.size === 0) {
      chartDataMap.set('--', { label: '--', count: 0, value: 0 });
    }

    return {
      totals,
      chartData: Array.from(chartDataMap.values()),
      rawDeposits: validDeposits,
    };
  }, [transactions, period, customFrom, customTo, statusFilter]);

  return {
    period,
    setPeriod,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    statusFilter,
    setStatusFilter,
    ...filteredData,
  };
}
