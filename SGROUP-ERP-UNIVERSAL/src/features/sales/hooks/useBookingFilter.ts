import { useMemo, useState } from 'react';
import { useSalesStore } from '../store/useSalesStore';
import { useGetBookings } from './useBookings';

export type BookingPeriod = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';

export function useBookingFilter() {
  const zustandBookings = useSalesStore(s => s.bookings);
  const { data: apiBookings } = useGetBookings();
  // Prefer API data if available, fallback to Zustand local data
  const bookings = (Array.isArray(apiBookings) && apiBookings.length > 0) ? apiBookings : zustandBookings;
  const [period, setPeriod] = useState<BookingPeriod>('WEEK');
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  const filteredData = useMemo(() => {
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

    const validBookings = bookings.filter(b => {
      const d = new Date(b.date);
      const inDateRange = d >= startDate && d <= endDate;
      if (!inDateRange) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchProject = b.project.toLowerCase().includes(q);
        const matchName = b.customerName?.toLowerCase().includes(q);
        const matchPhone = b.customerPhone?.toLowerCase().includes(q);
        return matchProject || matchName || matchPhone;
      }
      
      if (statusFilter !== 'ALL' && b.status !== statusFilter) {
        return false;
      }
      
      return true;
    });

    // Totals
    const totalBookingCount = validBookings.reduce((sum, b) => sum + b.bookingCount, 0);
    const uniqueCustomers = new Set(validBookings.map(b => b.customerPhone)).size; // KPI unique by phone
    const pendingCount = validBookings.filter(b => b.status === 'PENDING').length;
    const approvedCount = validBookings.filter(b => b.status === 'APPROVED').length;
    const rejectedCount = validBookings.filter(b => b.status === 'REJECTED').length;
    const approvedBookingSum = validBookings.filter(b => b.status === 'APPROVED').reduce((sum, b) => sum + b.bookingCount, 0);

    const totals = {
      totalBookingCount,
      uniqueCustomers,
      pendingCount,
      approvedCount,
      rejectedCount,
      approvedBookingSum,
    };

    // Chart data grouping
    const chartDataMap = new Map<string, { label: string; bookings: number; customers: number; approved: number }>();

    // Track unique customers per chart bucket
    const customersByBucket = new Map<string, Set<string>>();

    validBookings.forEach(b => {
      const d = new Date(b.date);
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

      const existing = chartDataMap.get(key) || { label, bookings: 0, customers: 0, approved: 0 };
      const customerSet = customersByBucket.get(key) || new Set<string>();
      customerSet.add(b.customerPhone);
      customersByBucket.set(key, customerSet);

      chartDataMap.set(key, {
        label,
        bookings: existing.bookings + b.bookingCount,
        customers: customerSet.size,
        approved: existing.approved + (b.status === 'APPROVED' ? b.bookingCount : 0),
      });
    });

    if (chartDataMap.size === 0) {
      chartDataMap.set('--', { label: '--', bookings: 0, customers: 0, approved: 0 });
    }

    return {
      totals,
      chartData: Array.from(chartDataMap.values()),
      rawBookings: validBookings,
    };
  }, [bookings, period, customFrom, customTo, searchQuery, statusFilter]);

  return {
    period,
    setPeriod,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    ...filteredData,
  };
}
