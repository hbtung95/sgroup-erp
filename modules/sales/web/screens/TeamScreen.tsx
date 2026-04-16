import React, { useState } from 'react';
import {
  Users, Plus, Search, UserCheck, Phone, Mail, LayoutGrid, List,
  Loader2, Target, Award,
} from 'lucide-react';
import { useStaff, useTeams, formatVND } from '../hooks/useSalesData';
import type { SalesStaff } from '../api/salesApi';
import {
  CinematicDrawer, DrawerSection, DrawerHeroCard, DrawerDetailRow,
  EmptyState, SkeletonCard,
} from '../components/shared';

// ═══════════════════════════════════════════════════════════
// TEAM SCREEN — Staff Management with 3D cards + Drawer
// Neo-Glassmorphism v2.2 • sg-stagger • perspective
// ═══════════════════════════════════════════════════════════

const ROLE_CONFIG: Record<string, { label: string; color: string; gradient: string }> = {
  sales:          { label: 'Sales',         color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', gradient: 'from-blue-400 to-blue-600' },
  senior_sales:   { label: 'Senior Sales',  color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20', gradient: 'from-indigo-400 to-indigo-600' },
  sales_manager:  { label: 'Manager',       color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', gradient: 'from-amber-400 to-amber-600' },
  sales_director: { label: 'Director',      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', gradient: 'from-emerald-400 to-emerald-600' },
};

export function TeamScreen() {
  const { data: staff, loading: staffLoading } = useStaff();
  const { data: teams, loading: teamsLoading } = useTeams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStaff, setSelectedStaff] = useState<SalesStaff | null>(null);

  const filtered = (staff || []).filter(s => {
    const matchSearch = !searchQuery || s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || s.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTeam = !selectedTeam || s.teamId === selectedTeam;
    return matchSearch && matchTeam;
  });

  const loading = staffLoading || teamsLoading;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 lg:px-8 py-5 border-b border-slate-100 dark:border-sg-border/40 bg-white/40 dark:bg-black/20 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <UserCheck size={18} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-sg-heading">Đội Ngũ Sales</h2>
              <span className="text-[11px] font-bold text-sg-muted">{filtered.length} nhân sự • {(teams || []).length} team</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[12px] font-black pointer-events-none">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Đồng bộ từ CRM</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-sg-muted" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Tìm nhân viên..."
              className="w-full h-10 pl-10 pr-4 bg-sg-btn-bg border border-sg-border rounded-xl text-[13px] font-semibold text-sg-heading placeholder:text-sg-muted outline-none focus:border-emerald-500/40 transition-colors" />
          </div>
          <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)} className="h-10 px-4 bg-sg-btn-bg border border-sg-border rounded-xl text-[12px] font-bold text-sg-heading outline-none">
            <option value="">Tất cả Teams</option>
            {(teams || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="flex items-center p-1 bg-sg-btn-bg border border-sg-border rounded-xl">
            <button onClick={() => setViewMode('grid')} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-sg-card text-emerald-500 shadow-sm border border-sg-border' : 'text-sg-muted'}`}><LayoutGrid size={15} /></button>
            <button onClick={() => setViewMode('list')} className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-sg-card text-emerald-500 shadow-sm border border-sg-border' : 'text-sg-muted'}`}><List size={15} /></button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Users size={40} className="text-indigo-500" />} title="Không tìm thấy nhân viên" description="Thử thay đổi bộ lọc hoặc thêm nhân viên mới." />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((s, idx) => (
              <div key={s.id} onClick={() => setSelectedStaff(s)} className="relative group perspective-distant sg-stagger cursor-pointer" style={{ animationDelay: `${(idx % 12) * 60}ms` }}>
                <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-sg-2xl border border-slate-200 dark:border-white/5 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-700 hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] group-hover:-translate-y-3 relative overflow-hidden">
                  {/* Glass effects */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                  <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full ${ROLE_CONFIG[s.role]?.color.split(' ')[1] || 'bg-slate-500/10'} blur-[60px] opacity-20 group-hover:opacity-60 transition-all duration-1000`} />

                  <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className={`w-14 h-14 rounded-xl bg-linear-to-br ${ROLE_CONFIG[s.role]?.gradient || 'from-slate-400 to-slate-600'} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700`}>
                      <span className="text-[18px] font-black text-white drop-shadow">{s.fullName[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[15px] font-black text-sg-heading truncate group-hover:text-emerald-500 transition-colors">{s.fullName}</span>
                      <span className="block text-[10px] font-bold text-sg-muted">{s.employeeCode}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-black ${ROLE_CONFIG[s.role]?.color || 'text-slate-500 bg-slate-500/10 border-slate-500/20'}`}>
                      {ROLE_CONFIG[s.role]?.label || s.role}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-4 relative z-10">
                    {s.phone && <div className="flex items-center gap-2 text-[12px] text-sg-muted"><Phone size={12} /> <span className="font-medium">{s.phone}</span></div>}
                    {s.email && <div className="flex items-center gap-2 text-[12px] text-sg-muted"><Mail size={12} /> <span className="font-medium truncate">{s.email}</span></div>}
                    {s.team && <div className="flex items-center gap-2 text-[12px] text-sg-muted"><Users size={12} /> <span className="font-semibold text-sg-heading">{s.team.name}</span></div>}
                  </div>

                  <div className="grid grid-cols-2 gap-2 relative z-10">
                    <div className="p-3 rounded-xl bg-sg-card/50 border border-sg-border/30 text-center">
                      <span className="block text-[9px] font-bold text-sg-muted uppercase">Target</span>
                      <span className="block text-[14px] font-black text-sg-heading">{formatVND(s.personalTarget)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-sg-card/50 border border-sg-border/30 text-center">
                      <span className="block text-[9px] font-bold text-sg-muted uppercase">Leads/tháng</span>
                      <span className="block text-[14px] font-black text-sg-heading">{s.leadsCapacity}</span>
                    </div>
                  </div>

                  <div className={`mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold relative z-10 ${
                    s.status === 'ACTIVE' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-400/10'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {s.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border shadow-sg-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-sg-border/40">
                  <th className="px-5 py-4 text-left text-[10px] font-black text-sg-muted uppercase">Nhân viên</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-sg-muted uppercase">Team</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-sg-muted uppercase">Vai trò</th>
                  <th className="px-4 py-4 text-right text-[10px] font-black text-sg-muted uppercase">Target</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-sg-muted uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr key={s.id} onClick={() => setSelectedStaff(s)} className="border-b border-slate-50 dark:border-sg-border/20 hover:bg-sg-card/30 transition-colors cursor-pointer group sg-stagger" style={{ animationDelay: `${idx * 30}ms` }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${ROLE_CONFIG[s.role]?.gradient || 'from-slate-400 to-slate-600'} flex items-center justify-center text-white text-[13px] font-black shadow-md`}>{s.fullName[0]}</div>
                        <div><span className="block text-[14px] font-bold text-sg-heading group-hover:text-emerald-500 transition-colors">{s.fullName}</span><span className="block text-[10px] font-medium text-sg-muted">{s.employeeCode}</span></div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[12px] font-semibold text-sg-muted">{s.team?.name || '—'}</td>
                    <td className="px-4 py-3.5 text-center"><span className={`inline-flex px-2.5 py-1 rounded-lg border text-[10px] font-black ${ROLE_CONFIG[s.role]?.color || 'text-slate-500 bg-slate-500/10 border-slate-500/20'}`}>{ROLE_CONFIG[s.role]?.label || s.role}</span></td>
                    <td className="px-4 py-3.5 text-right text-[13px] font-bold text-sg-heading">{formatVND(s.personalTarget)}</td>
                    <td className="px-4 py-3.5 text-center"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${s.status === 'ACTIVE' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-400/10'}`}><div className={`w-1.5 h-1.5 rounded-full ${s.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />{s.status === 'ACTIVE' ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Detail Drawer */}
      <CinematicDrawer
        isOpen={!!selectedStaff} onClose={() => setSelectedStaff(null)}
        title={selectedStaff?.fullName || ''} subtitle={ROLE_CONFIG[selectedStaff?.role || '']?.label || selectedStaff?.role}
        icon={selectedStaff ? <span className="text-[22px] font-black text-indigo-500">{selectedStaff.fullName[0]}</span> : undefined}
        accentColor="violet"
        footer={selectedStaff ? (
          <button onClick={() => {}} className="w-full h-14 flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[14px] font-black text-sg-heading transition-all hover:-translate-y-1 hover:bg-slate-200 dark:hover:bg-white/10">
            Hồ sơ quản lý bởi Bizfly CRM ↗
          </button>
        ) : undefined}
      >
        {selectedStaff && (
          <>
            <DrawerHeroCard gradient="from-indigo-500/10 to-violet-500/5" borderColor="border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2"><Award size={14} className="text-indigo-500" /><span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">KPI Target</span></div>
              <div className="text-[36px] font-black text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-violet-400 leading-tight">{formatVND(selectedStaff.personalTarget)}</div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-indigo-500/10">
                <div><span className="text-[10px] font-bold text-sg-muted uppercase">Leads/tháng</span><br /><span className="text-[15px] font-black text-sg-heading">{selectedStaff.leadsCapacity}</span></div>
                <div className="text-right"><span className="text-[10px] font-bold text-sg-muted uppercase">Trạng thái</span><br /><span className={`text-[15px] font-black ${selectedStaff.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'}`}>{selectedStaff.status === 'ACTIVE' ? '🟢 Active' : '⚪ Inactive'}</span></div>
              </div>
            </DrawerHeroCard>
            <DrawerSection title="Thông Tin" icon={<UserCheck size={14} className="text-indigo-500" />}>
              <div className="grid grid-cols-1 gap-4">
                <DrawerDetailRow icon={<Phone size={16} className="text-emerald-500" />} label="Điện thoại" value={selectedStaff.phone || 'N/A'} />
                <DrawerDetailRow icon={<Mail size={16} className="text-blue-500" />} label="Email" value={selectedStaff.email || 'N/A'} />
                <DrawerDetailRow icon={<Users size={16} className="text-amber-500" />} label="Team" value={selectedStaff.team?.name || 'Chưa phân team'} />
                <DrawerDetailRow icon={<Target size={16} className="text-violet-500" />} label="Mã NV" value={selectedStaff.employeeCode} />
              </div>
            </DrawerSection>
          </>
        )}
      </CinematicDrawer>
    </div>
  );
}
