import { useMemo, useState } from 'react';
import { useGetBookings } from './useBookings';

export type BookingPeriod = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';

export function useBookingFilter() {
  const { data: bookings = [], isLoading, error } = useGetBookings();
  const [period, setPeriod] = useState<BookingPeriod>('WEEK');
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELED'>('ALL');

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

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const validBookings = bookings.filter(booking => {
      const date = new Date(booking.date);
      if (date < startDate || date > endDate) {
        return false;
      }

      if (statusFilter !== 'ALL' && booking.status !== statusFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        booking.project.toLowerCase().includes(normalizedQuery) ||
        booking.customerName?.toLowerCase().includes(normalizedQuery) ||
        booking.customerPhone?.toLowerCase().includes(normalizedQuery)
      );
    });

    const totalBookingCount = validBookings.reduce((sum, booking) => sum + booking.bookingCount, 0);
    const uniqueCustomers = new Set(validBookings.map(booking => booking.customerPhone)).size;
    const pendingCount = validBookings.filter(booking => booking.status === 'PENDING').length;
    const approvedCount = validBookings.filter(booking => booking.status === 'APPROVED').length;
    const rejectedCount = validBookings.filter(booking => booking.status === 'REJECTED').length;
    const approvedBookingSum = validBookings
      .filter(booking => booking.status === 'APPROVED')
      .reduce((sum, booking) => sum + booking.bookingCount, 0);

    const chartDataMap = new Map<string, { label: string; bookings: number; customers: number; approved: number }>();
    const customersByBucket = new Map<string, Set<string>>();

    validBookings.forEach(booking => {
      const date = new Date(booking.date);
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

      const existing = chartDataMap.get(key) || { label, bookings: 0, customers: 0, approved: 0 };
      const customerSet = customersByBucket.get(key) || new Set<string>();
      customerSet.add(booking.customerPhone);
      customersByBucket.set(key, customerSet);

      chartDataMap.set(key, {
        label,
        bookings: existing.bookings + booking.bookingCount,
        customers: customerSet.size,
        approved: existing.approved + (booking.status === 'APPROVED' ? booking.bookingCount : 0),
      });
    });

    if (chartDataMap.size === 0) {
      chartDataMap.set('--', { label: '--', bookings: 0, customers: 0, approved: 0 });
    }

    return {
      totals: {
        totalBookingCount,
        uniqueCustomers,
        pendingCount,
        approvedCount,
        rejectedCount,
        approvedBookingSum,
      },
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
    isLoading,
    error,
    ...filteredData,
  };
}
