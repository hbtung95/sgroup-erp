import { useMemo, useState } from 'react';
import { useGetDeposits } from './useDeposits';
import type { BookingPeriod } from './useBookingFilter';

export function useDepositFilter() {
  const { data: deposits = [], isLoading, error } = useGetDeposits();
  const [period, setPeriod] = useState<BookingPeriod>('MONTH');
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUNDED'>(
    'ALL',
  );

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date(now);

    if (period === 'CUSTOM') {
      if (customFrom) {
        startDate = new Date(customFrom);
      } else {
        startDate.setDate(now.getDate() - 7);
      }
      startDate.setHours(0, 0, 0, 0);

      if (customTo) {
        endDate = new Date(customTo);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      }
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
          const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
          startDate.setMonth(quarterMonth, 1);
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

    const validDeposits = deposits.filter(deposit => {
      const date = new Date(deposit.date);
      if (date < startDate || date > endDate) {
        return false;
      }

      if (statusFilter !== 'ALL' && deposit.status !== statusFilter) {
        return false;
      }

      return true;
    });

    const totalDeposits = validDeposits.length;
    const pendingCount = validDeposits.filter(deposit => deposit.status === 'PENDING').length;
    const confirmedCount = validDeposits.filter(deposit => deposit.status === 'CONFIRMED').length;
    const totalValue = validDeposits.reduce((sum, deposit) => sum + (deposit.depositAmount || 0), 0);
    const confirmedValue = validDeposits
      .filter(deposit => deposit.status === 'CONFIRMED')
      .reduce((sum, deposit) => sum + (deposit.depositAmount || 0), 0);

    const chartDataMap = new Map<string, { label: string; count: number; value: number }>();

    validDeposits.forEach(deposit => {
      const date = new Date(deposit.date);
      let key: string;
      let label: string;

      if (period === 'DAY') {
        key = `${date.getHours()}h`;
        label = `${date.getHours()}:00`;
      } else if (period === 'WEEK' || period === 'MONTH' || period === 'CUSTOM') {
        key = `${date.getDate()}/${date.getMonth() + 1}`;
        label = `${date.getDate()}/${date.getMonth() + 1}`;
      } else {
        key = `T${date.getMonth() + 1}`;
        label = `T${date.getMonth() + 1}`;
      }

      const existing = chartDataMap.get(key) || { label, count: 0, value: 0 };
      chartDataMap.set(key, {
        label,
        count: existing.count + 1,
        value: existing.value + (deposit.depositAmount || 0),
      });
    });

    if (chartDataMap.size === 0) {
      chartDataMap.set('--', { label: '--', count: 0, value: 0 });
    }

    return {
      totals: {
        totalDeposits,
        pendingCount,
        confirmedCount,
        totalValue,
        confirmedValue,
      },
      chartData: Array.from(chartDataMap.values()),
      rawDeposits: validDeposits,
    };
  }, [deposits, period, customFrom, customTo, statusFilter]);

  return {
    period,
    setPeriod,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    statusFilter,
    setStatusFilter,
    isLoading,
    error,
    ...filteredData,
  };
}
