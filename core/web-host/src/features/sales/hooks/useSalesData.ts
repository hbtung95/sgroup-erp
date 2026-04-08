import { useMemo } from 'react';
import { useSalesStore, ActivityEntry, BookingEntry, TransactionEntry } from '../store/useSalesStore';

export type { ActivityEntry, BookingEntry, TransactionEntry };

export function useSalesData() {
  const activities = useSalesStore(s => s.activities);
  const bookings = useSalesStore(s => s.bookings);
  const transactions = useSalesStore(s => s.transactions);
  const addActivity = useSalesStore(s => s.addActivity);
  const addBooking = useSalesStore(s => s.addBooking);
  const addTransaction = useSalesStore(s => s.addTransaction);

  // Aggregated KPIs
  const kpiData = useMemo(() => {
    // Only count approved/completed transactions for revenue, exclude PENDING_DEPOSIT
    const validTransactions = transactions.filter(t => t.status !== 'PENDING_DEPOSIT' && t.status !== 'AVAILABLE');
    
    const totalTransactions = validTransactions.length;
    const totalRevenue = validTransactions.reduce((sum, t) => sum + t.transactionValue, 0);
    const totalLeads = activities.reduce((sum, a) => sum + a.newLeads, 0);
    const totalCalls = activities.reduce((sum, a) => sum + a.callsCount, 0);
    const totalMeetings = activities.reduce((sum, a) => sum + a.meetingsMade, 0);
    const totalBookings = bookings.reduce((sum, b) => sum + b.bookingCount, 0);

    const baseLeadTarget = 100; // Let's pretend they have 100 base leads
    const funnelLeads = Math.max(totalLeads, baseLeadTarget);
    
    return {
      totalTransactions,
      totalRevenue: Number(totalRevenue.toFixed(1)),
      totalLeads,
      totalCalls,
      totalMeetings,
      totalBookings,
      funnel: [
        { stage: 'Khách hàng mới (Leads)', count: funnelLeads, color: '#94a3b8', pct: 100 },
        { stage: 'Tổng Lịch Hẹn', count: totalMeetings, color: '#3b82f6', pct: Math.round((totalMeetings / funnelLeads) * 100) || 0 },
        { stage: 'Tổng Giữ Chỗ', count: totalBookings, color: '#8b5cf6', pct: Math.round((totalBookings / funnelLeads) * 100) || 0 },
        { stage: 'Giao Dịch Thành Công', count: totalTransactions, color: '#10b981', pct: Math.round((totalTransactions / funnelLeads) * 100) || 0 },
      ]
    };
  }, [activities, bookings, transactions]);

  return {
    activities, addActivity,
    bookings, addBooking,
    transactions, addTransaction,
    kpiData
  };
}
