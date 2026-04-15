import React, { useState } from 'react';
import {
  Users, Search, PhoneCall, ArrowRight, TrendingUp,
  Snowflake, Flame, CheckCircle2, Plus, Mail, Calendar
} from 'lucide-react';

/* ════════════════════════════════════════════════════════
   MOCK DATA
   ════════════════════════════════════════════════════════ */

const MOCK_CUSTOMERS = [
  { id: '1', fullName: 'Nguyễn Văn A', phone: '0901234567', status: 'HOT', assignedTo: 'nv1', date: '14/04/2026', email: 'vana@gmail.com', lastInteraction: 'Gọi điện lúc 14:00' },
  { id: '2', fullName: 'Trần Thị B', phone: '0912345678', status: 'WARM', assignedTo: 'nv1', date: '13/04/2026', email: 'tb.98@yahoo.com', lastInteraction: 'Gửi Email báo giá' },
  { id: '3', fullName: 'Lê Văn C', phone: '0987654321', status: 'COLD', assignedTo: 'nv2', date: '12/04/2026', email: 'le.vanc@c-corp.vn', lastInteraction: 'Không nghe máy' },
  { id: '4', fullName: 'Phạm Thị D', phone: '0933445566', status: 'COMPLETED', assignedTo: 'nv1', date: '10/04/2026', email: 'phamthid123@gmail.com', lastInteraction: 'Đã ký HĐ' },
  { id: '5', fullName: 'Vũ Quốc E', phone: '0977889900', status: 'HOT', assignedTo: 'nv2', date: '14/04/2026', email: 'vqe.invest@gmail.com', lastInteraction: 'Zalo: Xin mặt bằng' },
  { id: '6', fullName: 'Đặng Kim F', phone: '0944556677', status: 'WARM', assignedTo: 'nv3', date: '11/04/2026', email: 'dkf@finance.vn', lastInteraction: 'Hẹn gặp T7' },
];

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  HOT: { label: 'HOT', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  WARM: { label: 'WARM', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  COLD: { label: 'COLD', icon: Snowflake, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  COMPLETED: { label: 'WON', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

const AVATAR_GRADIENTS = [
  'from-indigo-500 to-purple-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-violet-600',
];

/* ════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════ */

export function CustomerScreen() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  const tabs = [
    { id: 'ALL', label: 'Tất cả Leads', count: MOCK_CUSTOMERS.length },
    { id: 'HOT', label: 'HOT', icon: Flame, color: 'text-rose-500' },
    { id: 'WARM', label: 'WARM', icon: TrendingUp, color: 'text-amber-500' },
    { id: 'COLD', label: 'COLD', icon: Snowflake, color: 'text-blue-500' },
    { id: 'COMPLETED', label: 'Đã Win', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  const filtered = MOCK_CUSTOMERS.filter(c => {
    const matchStatus = activeTab === 'ALL' || c.status === activeTab;
    const matchSearch = c.fullName.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-10 overflow-hidden">

      {/* Cinematic Ambient Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-[100%] blur-[120px] pointer-events-none -z-10" />

      {/* ═══ Header & Controls ═══ */}
      <div className="px-6 sm:px-10 lg:px-12 py-8 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-black/30 backdrop-blur-3xl relative z-10 shadow-[0_8px_32px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sg-stagger" style={{ animationDelay: '0ms' }}>
          <div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 w-fit mb-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <Users size={14} className="text-emerald-500 drop-shadow-sm" />
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em]">Quản Lý Khách Hàng & CRM</span>
            </div>
            <h2 className="text-[36px] sm:text-[40px] font-black text-sg-heading tracking-tight drop-shadow-sm leading-none">Khách Hàng (CRM)</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative group w-full sm:w-auto">
              <div className="absolute inset-0 bg-linear-to-r from-emerald-500/0 via-teal-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity" />
              <div className="relative flex items-center h-13 bg-white dark:bg-black/40 backdrop-blur-2xl border border-slate-200 dark:border-white/5 hover:border-emerald-500/40 rounded-2xl px-5 transition-all w-full sm:w-80 shadow-sm">
                <Search size={18} className="text-sg-muted group-hover:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Tìm Tên, SĐT, Email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none ml-3 text-[14px] font-bold text-sg-heading w-full placeholder:text-sg-muted/60"
                />
              </div>
            </div>

            {/* Add Lead Button */}
            <button className="h-13 w-full sm:w-auto px-6 flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-2xl transition-all shadow-[0_8px_24px_rgba(16,185,129,0.3)] hover:shadow-[0_16px_32px_rgba(16,185,129,0.5)] hover:-translate-y-1 relative overflow-hidden group shrink-0">
              <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl" />
              <Plus size={20} className="text-white relative z-10" />
              <span className="text-[14px] font-black text-white relative z-10">Tạo Lead Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Main Content ═══ */}
      <div className="flex-1 px-6 sm:px-10 lg:px-12 py-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">

        {/* Filter Tabs */}
        <div className="sg-stagger flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2" style={{ animationDelay: '100ms' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 shrink-0 h-12 px-5 rounded-xl text-[13px] font-black transition-all border shadow-sm ${
                  isActive
                    ? 'bg-white dark:bg-sg-card text-sg-heading border-slate-200 dark:border-sg-border shadow-[0_4px_16px_rgba(0,0,0,0.06)]'
                    : 'bg-white/50 dark:bg-black/20 border-slate-100 dark:border-white/5 text-sg-muted hover:text-sg-heading hover:bg-white dark:hover:bg-black/40'
                }`}
              >
                {tab.icon && (
                  <tab.icon size={14} className={isActive ? (tab.color || '') : 'text-inherit'} />
                )}
                {tab.label}
                {tab.count !== undefined && (
                  <span className="text-[11px] font-black bg-sg-btn-bg px-2 py-0.5 rounded-lg border border-sg-border">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* CRM Data Table */}
        <div className="sg-stagger flex-1 bg-white dark:bg-black/30 backdrop-blur-3xl border border-slate-200/80 dark:border-white/5 rounded-[32px] shadow-md relative overflow-hidden flex flex-col" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 bg-linear-to-bl from-emerald-500/5 to-transparent pointer-events-none" />

          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/5 bg-slate-50/80 dark:bg-black/40 relative z-10">
                  <th className="px-8 py-5 text-[11px] font-black text-sg-subtext uppercase tracking-widest whitespace-nowrap">Hồ Sơ Khách Hàng</th>
                  <th className="px-8 py-5 text-[11px] font-black text-sg-subtext uppercase tracking-widest whitespace-nowrap">Liên Hệ</th>
                  <th className="px-8 py-5 text-[11px] font-black text-sg-subtext uppercase tracking-widest whitespace-nowrap">Trạng Thái Lead</th>
                  <th className="px-8 py-5 text-[11px] font-black text-sg-subtext uppercase tracking-widest whitespace-nowrap">Tương Tác Gần Nhất</th>
                  <th className="px-8 py-5 text-[11px] font-black text-sg-subtext uppercase tracking-widest whitespace-nowrap text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center relative z-10">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <Users size={48} className="text-sg-muted mb-4" strokeWidth={1.5} />
                        <span className="text-[14px] font-black text-sg-muted uppercase tracking-widest">Không có dữ liệu</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((c, idx) => {
                  const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.COLD;
                  const StatusIcon = cfg.icon;
                  const avatarGradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];

                  return (
                    <tr key={c.id} className="border-b border-slate-100 dark:border-white/5 relative group transition-colors hover:bg-emerald-50/50 dark:hover:bg-white/5 z-10 cursor-pointer">
                      {/* Hover accent line */}
                      <td className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-r" />

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-[16px] bg-gradient-to-br ${avatarGradient} border border-white/20 shadow-inner flex items-center justify-center text-white text-[13px] font-black shrink-0`}>
                            {c.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[15px] font-black text-sg-heading group-hover:text-emerald-600 transition-colors drop-shadow-sm truncate">{c.fullName}</span>
                            <span className="text-[11px] font-bold text-sg-muted mt-0.5 truncate flex items-center gap-1.5">
                              <Mail size={10} className="shrink-0" /> {c.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-[14px] font-bold text-sg-heading bg-slate-50 dark:bg-black/40 w-fit px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/5">
                          <PhoneCall size={14} className="text-emerald-500" />
                          {c.phone}
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit shadow-sm ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                          <StatusIcon size={12} /> {cfg.label}
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-0.5 min-w-[120px]">
                          <span className="text-[13px] font-bold text-sg-heading">{c.lastInteraction}</span>
                          <span className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar size={10} /> {c.date}
                          </span>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <button className="h-10 px-5 bg-white dark:bg-black/40 hover:bg-emerald-500 hover:border-emerald-500 border border-slate-200 dark:border-white/5 rounded-xl text-[12px] font-black text-sg-heading hover:text-white transition-all shadow-sm flex items-center gap-2 ml-auto">
                          Chi tiết <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
