import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Activity, Calendar, User, Building2, Search, Filter, ChevronDown,
  PhoneCall, Users, Target, CheckCircle2, TrendingUp, Briefcase, Plus
} from 'lucide-react';
import { useSalesRole } from '../components/shared/RoleContext';
import { salesOpsApi } from '../api/salesApi';
import { CURRENT_USER, CURRENT_TEAM } from '../api/salesMocks';
import { SkeletonCard, EmptyState } from '../components/shared';
import { ActivityEntryModal } from '../components/ActivityEntryModal';

// ═══════════════════════════════════════════════════════════
// ACTIVITY LOG SCREEN — Productivity Tracking
// Neo-Glassmorphism v2.2 • sg-stagger animations
// ═══════════════════════════════════════════════════════════

interface ActivitySummary {
  id: string;
  date: string;
  staffName: string;
  team: string;
  calls: number;
  leads: number;
  meetings: number;
  visits: number;
  bookings: number;
  deposits: number;
  points: number;
}

function CustomSelect({ 
  value, 
  onChange, 
  options, 
  icon,
  placeholder = "Chọn..."
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { label: string, value: string }[];
  icon: React.ReactNode;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;
  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery("");
        }}
        className="flex items-center gap-2 bg-white/50 dark:bg-black/40 border border-sg-border rounded-xl px-3 py-2.5 outline-none hover:bg-white/80 dark:hover:bg-black/60 transition-colors ui-trigger shrink-0 focus:ring-2 focus:ring-blue-500/20"
      >
        <span className="text-sg-muted">{icon}</span>
        <span className="text-[12px] font-bold text-sg-heading min-w-[100px] text-left truncate">{selectedLabel}</span>
        <ChevronDown size={14} className={`text-sg-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 min-w-[220px] bg-white/90 dark:bg-black/90 backdrop-blur-3xl border border-sg-border rounded-xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1)] dark:shadow-black/50 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-sg-border/60">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sg-muted" />
              <input
                type="text"
                autoFocus
                placeholder="Tìm kiếm nhanh..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/40 border border-sg-border rounded-lg pl-7 pr-3 py-1.5 text-[12px] font-medium text-sg-heading focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>
          </div>
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-[12px] font-medium text-sg-muted">
                Không tìm thấy...
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left flex items-center px-3 py-2.5 rounded-lg text-[13px] font-bold transition-colors ${
                    value === opt.value 
                      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                      : 'text-sg-heading hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ActivityLogScreen({ mode = 'personal' }: { mode?: 'personal' | 'team' }) {
  const { role } = useSalesRole();
  const [summaries, setSummaries] = useState<ActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterTeam, setFilterTeam] = useState('all');
  const [filterStaff, setFilterStaff] = useState('all');

  const filteredSummaries = React.useMemo(() => {
    return summaries.filter(s => {
      if (filterTeam !== 'all' && s.team !== filterTeam) return false;
      if (filterStaff !== 'all' && s.staffName !== filterStaff) return false;
      return true;
    });
  }, [summaries, filterTeam, filterStaff]);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const [resActs, resBooks, resDeps] = await Promise.all([
        salesOpsApi.listActivities(),
        salesOpsApi.listBookings(),
        salesOpsApi.listDeposits()
      ]);
      
      let acts = resActs.data;
      let books = resBooks.data;
      let deps = resDeps.data;

      // Personal mode: only show current user's items
      if (mode === 'personal' || role === 'sales_staff') {
        acts = acts.filter(act => act.staffId === CURRENT_USER.id);
        books = books.filter(b => (b as any).staffId === CURRENT_USER.id);
        deps = deps.filter(d => (d as any).createdByUserId === CURRENT_USER.id || (d as any).staffId === CURRENT_USER.id);
      }
      // Team mode: Manager sees team items
      else if (mode === 'team' && role === 'sales_manager') {
        acts = acts.filter(act => act.teamId === CURRENT_TEAM.id || act.staffId === CURRENT_USER.id);
        books = books.filter(b => b.teamName === CURRENT_TEAM.name || (b as any).staffId === CURRENT_USER.id);
        deps = deps.filter(d => (d as any).teamName === CURRENT_TEAM.name || (d as any).staffId === CURRENT_USER.id);
      }

      const map = new Map<string, ActivitySummary>();
      
      // We will parse the local format carefully
      const toDateStr = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('vi-VN'); // eg: 10/4/2026
      };

      acts.forEach(a => {
        const dateStr = toDateStr(a.activityDate || new Date().toISOString());
        const staffName = a.staffName || (a.staffId === CURRENT_USER.id ? CURRENT_USER.fullName : 'Nhân Sự Khác');
        const teamName = (a as any).teamName || (a.teamId === CURRENT_TEAM.id ? CURRENT_TEAM.name : 'Khác');
        const key = `${dateStr}_${staffName}`;
        if (!map.has(key)) {
          map.set(key, { id: key, date: dateStr, staffName, team: teamName, calls: 0, leads: 0, meetings: 0, visits: 0, bookings: 0, deposits: 0, points: 0 });
        }
        const row = map.get(key)!;
        row.calls += a.callsCount || 0;
        row.leads += a.newLeads || 0;
        row.meetings += a.meetingsMade || 0;
        row.visits += a.siteVisits || 0;
      });

      books.forEach(b => {
        const dateStr = toDateStr(b.bookingDate || b.createdAt);
        const staffName = b.staffName || CURRENT_USER.fullName;
        const teamName = b.teamName || CURRENT_TEAM.name;
        const key = `${dateStr}_${staffName}`;
        if (!map.has(key)) {
          map.set(key, { id: key, date: dateStr, staffName, team: teamName, calls: 0, leads: 0, meetings: 0, visits: 0, bookings: 0, deposits: 0, points: 0 });
        }
        map.get(key)!.bookings += 1;
      });

      deps.forEach(d => {
        const dateStr = toDateStr((d as any).depositDate || d.createdAt);
        const staffName = (d as any).staffName || CURRENT_USER.fullName;
        const teamName = (d as any).teamName || CURRENT_TEAM.name;
        const key = `${dateStr}_${staffName}`;
        if (!map.has(key)) {
          map.set(key, { id: key, date: dateStr, staffName, team: teamName, calls: 0, leads: 0, meetings: 0, visits: 0, bookings: 0, deposits: 0, points: 0 });
        }
        map.get(key)!.deposits += 1;
      });

      // Compute Points
      const result = Array.from(map.values()).map(row => {
        row.points = (row.leads * 1) + (row.meetings * 10) + (row.visits * 20) + (row.bookings * 30) + (row.deposits * 60);
        return row;
      });

      // Sort by Date Descending
      result.sort((a, b) => {
         const [d1, m1, y1] = a.date.split('/');
         const [d2, m2, y2] = b.date.split('/');
         const dateA = new Date(`${y1}-${m1}-${d1}`).getTime();
         const dateB = new Date(`${y2}-${m2}-${d2}`).getTime();
         return dateB - dateA;
      });

      setSummaries(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [role, mode]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative z-20 px-6 lg:px-8 py-5 border-b border-slate-100 dark:border-sg-border/40 bg-white/40 dark:bg-black/20 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Activity size={18} className="text-violet-500" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-sg-heading">
                {mode === 'team' ? 'Nhật Ký Năng Suất Team' : 'Nhật Ký Năng Suất'}
              </h2>
              <span className="text-[11px] font-bold text-sg-muted">
                {mode === 'team' ? 'Dữ liệu toàn đội' : 'Dữ liệu cá nhân'} • {filteredSummaries.length} bản ghi
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mode === 'team' && (
              <>
                <CustomSelect
                  value={filterTeam}
                  onChange={setFilterTeam}
                  icon={<Users size={14} />}
                  options={[
                    { label: 'Tất cả Team', value: 'all' },
                    ...[...new Set(summaries.map(s => s.team))].map(t => ({ label: t, value: t }))
                  ]}
                />
                
                <CustomSelect
                  value={filterStaff}
                  onChange={setFilterStaff}
                  icon={<User size={14} />}
                  options={[
                    { label: 'Tất cả nhân sự', value: 'all' },
                    ...[...new Set(summaries.map(s => s.staffName))].map(sn => ({ label: sn, value: sn }))
                  ]}
                />
              </>
            )}
            <button onClick={fetchActivities} className="flex items-center gap-2 px-4 py-2.5 bg-white/50 dark:bg-black/20 border border-sg-border rounded-xl text-[12px] font-bold text-sg-muted hover:text-sg-heading transition-colors">
              Refresh
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-emerald-500 to-emerald-600 border border-emerald-500/20 rounded-xl text-[12px] font-black text-white hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all"
            >
              <Plus size={16} /> Nhập Hoạt Động
            </button>
          </div>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="p-6 lg:p-8 shrink-0 pb-0">
        <div className="grid grid-cols-6 gap-4">
          <StatCard title="Cuộc Gọi" value={filteredSummaries.reduce((a,b)=>a+b.calls,0)} icon={<PhoneCall size={18} />} color="text-blue-500" />
          <StatCard title="Khách Quan Tâm" value={filteredSummaries.reduce((a,b)=>a+b.leads,0)} icon={<Target size={18} />} color="text-amber-500" />
          <StatCard title="Gặp Tư Vấn" value={filteredSummaries.reduce((a,b)=>a+b.meetings,0)} icon={<Briefcase size={18} />} color="text-violet-500" />
          <StatCard title="Trải Nghiệm" value={filteredSummaries.reduce((a,b)=>a+b.visits,0)} icon={<Building2 size={18} />} color="text-indigo-500" />
          <StatCard title="Giữ Chỗ" value={filteredSummaries.reduce((a,b)=>a+b.bookings,0)} icon={<Activity size={18} />} color="text-pink-500" />
          <StatCard title="Đặt Cọc" value={filteredSummaries.reduce((a,b)=>a+b.deposits,0)} icon={<CheckCircle2 size={18} />} color="text-emerald-500" />
        </div>
      </div>

      {/* Data Grid */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredSummaries.length === 0 ? (
          <EmptyState icon={<Activity size={32} />} title="Không có dữ liệu" description="Chưa có nhật ký hoạt động nào phù hợp." />
        ) : (
          <div className="bg-white/60 dark:bg-black/30 backdrop-blur-2xl rounded-sg-xl border border-slate-200/80 dark:border-sg-border shadow-sg-sm overflow-hidden border-t-0">
             <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left">
                   <thead>
                      <tr className="border-b border-slate-200/80 dark:border-sg-border bg-slate-50/50 dark:bg-white/5">
                         <th className="px-6 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest whitespace-nowrap">Ngày</th>
                         <th className="px-4 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest whitespace-nowrap">Nhân Sự</th>
                         <th className="px-4 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest whitespace-nowrap">Team</th>
                         <th className="px-4 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest whitespace-nowrap text-center">Cuộc Gọi</th>
                         <th className="px-4 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest whitespace-nowrap text-center">Khách Quan Tâm</th>
                         <th className="px-4 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest whitespace-nowrap text-center">Gặp Tư Vấn</th>
                         <th className="px-4 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest whitespace-nowrap text-center">Gặp Trải Nghiệm</th>
                         <th className="px-4 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest whitespace-nowrap text-center">Giữ Chỗ</th>
                         <th className="px-4 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest whitespace-nowrap text-center">Đặt Cọc</th>
                         <th className="px-6 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest whitespace-nowrap text-right bg-emerald-50/30 dark:bg-transparent">Điểm</th>
                      </tr>
                   </thead>
                   <tbody>
                      {filteredSummaries.map((row, idx) => (
                         <tr key={row.id} className="border-b border-slate-100 dark:border-sg-border/50 hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors sg-stagger" style={{ animationDelay: `${idx * 40}ms` }}>
                            <td className="px-6 py-4 text-[13px] font-black text-sg-heading whitespace-nowrap">{row.date}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <User size={14} className="text-sg-muted" />
                                <span className="text-[13px] font-bold text-sg-heading">{row.staffName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-[12px] font-bold text-sg-muted whitespace-nowrap">{row.team}</td>
                            <td className="px-4 py-4 text-[15px] font-black text-blue-500 text-center">{row.calls}</td>
                            <td className="px-4 py-4 text-[15px] font-black text-amber-500 text-center">{row.leads}</td>
                            <td className="px-4 py-4 text-[15px] font-black text-violet-500 text-center">{row.meetings}</td>
                            <td className="px-4 py-4 text-[15px] font-black text-indigo-500 text-center">{row.visits}</td>
                            <td className="px-4 py-4 text-[15px] font-black text-pink-500 text-center">{row.bookings}</td>
                            <td className="px-4 py-4 text-[15px] font-black text-rose-500 text-center">{row.deposits}</td>
                            <td className="px-6 py-4 text-[18px] font-black text-emerald-600 dark:text-emerald-400 text-right bg-emerald-50/30 dark:bg-transparent">{row.points}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>

      <ActivityEntryModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          fetchActivities(); // Refresh sau khi thêm mới
        }} 
      />

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-linear-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/40 hover:-translate-y-1 hover:shadow-emerald-500/60 flex items-center justify-center transition-all z-40 sg-stagger group"
        style={{ animationDelay: '800ms' }}
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number | string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-sg-xl border border-slate-200/80 dark:border-sg-border p-5 flex items-center gap-4 shadow-sg-sm">
      <div className={`w-12 h-12 rounded-2xl bg-sg-card/50 flex shrink-0 flex-center border border-sg-border justify-center items-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold text-sg-muted uppercase tracking-wider">{title}</p>
        <p className={`text-[20px] font-black ${color} truncate`}>{value}</p>
      </div>
    </div>
  );
}
