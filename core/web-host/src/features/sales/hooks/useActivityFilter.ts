import { useMemo, useState } from 'react';
import { useSalesStore } from '../store/useSalesStore';

export type ActivityPeriod = 'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'CUSTOM';

export function useActivityFilter() {
  const activities = useSalesStore(s => s.activities);
  const [period, setPeriod] = useState<ActivityPeriod>('WEEK');
  const [customFrom, setCustomFrom] = useState<Date | null>(null);
  const [customTo, setCustomTo] = useState<Date | null>(null);

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

    const validActivities = activities.filter(a => {
      const d = new Date(a.date);
      return d >= startDate && d <= endDate;
    });

    const totals = validActivities.reduce((acc, curr) => ({
      postsCount: acc.postsCount + curr.postsCount,
      callsCount: acc.callsCount + curr.callsCount,
      newLeads: acc.newLeads + curr.newLeads,
      meetingsMade: acc.meetingsMade + curr.meetingsMade,
    }), { postsCount: 0, callsCount: 0, newLeads: 0, meetingsMade: 0 });

    // Chart grouping
    const chartDataMap = new Map<string, { label: string, calls: number, leads: number, meetings: number, posts: number }>();

    validActivities.forEach(a => {
      const d = new Date(a.date);
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

      const existing = chartDataMap.get(key) || { label, calls: 0, leads: 0, meetings: 0, posts: 0 };
      chartDataMap.set(key, {
        label,
        calls: existing.calls + a.callsCount,
        leads: existing.leads + a.newLeads,
        meetings: existing.meetings + a.meetingsMade,
        posts: existing.posts + a.postsCount,
      });
    });

    if (chartDataMap.size === 0) {
      chartDataMap.set('--', { label: '--', calls: 0, leads: 0, meetings: 0, posts: 0 });
    }

    return {
      totals,
      chartData: Array.from(chartDataMap.values()),
      rawActivities: validActivities,
    };
  }, [activities, period, customFrom, customTo]);

  return {
    period,
    setPeriod,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    ...filteredData,
  };
}
