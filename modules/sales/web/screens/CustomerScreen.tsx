import React, { useState, useCallback } from 'react';
import {
  Users, Plus, Search, Filter, ChevronLeft, ChevronRight,
  Phone, Mail, MapPin, Loader2, Edit2, Trash2, Eye,
  X, Save, UserPlus, Download, LayoutGrid, List,
  DollarSign, Calendar, Tag, Briefcase,
} from 'lucide-react';
import { useCustomers, useCustomerActions, formatCurrency } from '../hooks/useSalesData';
import type { Customer } from '../api/salesApi';
import {
  CinematicDrawer, DrawerSection, DrawerHeroCard, DrawerDetailRow,
  EmptyState, ConfirmModal,
} from '../components/shared';
import { useToastActions } from '../components/shared/Toast';

// ═══════════════════════════════════════════════════════════
// CUSTOMER SCREEN — Full CRUD + Grid/List + CinematicDrawer
// Neo-Glassmorphism v2.2 • sg-stagger animations
// ═══════════════════════════════════════════════════════════

const STATUS_CONFIG: Record<string, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  HOT:       { label: 'Nóng',    emoji: '🔥', color: 'text-rose-500',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20' },
  WARM:      { label: 'Ấm',     emoji: '☀️', color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  COLD:      { label: 'Lạnh',    emoji: '❄️', color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  COMPLETED: { label: 'Đã chốt', emoji: '✅', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  LOST:      { label: 'Mất',     emoji: '❌', color: 'text-slate-400',   bg: 'bg-slate-400/10',   border: 'border-slate-400/20' },
};

const SOURCE_LABELS: Record<string, string> = {
  MARKETING: '📢 Marketing', SELF_GEN: '🎯 Tự kiếm', REFERRAL: '🤝 Giới thiệu',
  WALK_IN: '🚶 Walk-in', BIZFLY_CRM: '🔄 Bizfly', OTHER: '📋 Khác',
};

export function CustomerScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const { data: customers, loading, setFilter } = useCustomers({
    page: 1, limit: 50, search: searchQuery, status: statusFilter,
  });

  let toast: ReturnType<typeof useToastActions>;
  try { toast = useToastActions(); } catch { toast = { success: () => {}, error: () => {}, warning: () => {}, info: () => {} }; }

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    setFilter(prev => ({ ...prev, search: q, page: 1 }));
  }, [setFilter]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ════ HEADER ════ */}
      <div className="px-6 lg:px-8 py-5 border-b border-slate-100 dark:border-sg-border/40 bg-white/40 dark:bg-black/20 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-sg-heading">Quản Lý Khách Hàng</h2>
              <span className="text-[11px] font-bold text-sg-muted">{(customers || []).length} khách hàng</span>
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
            <input
              type="text" value={searchQuery} onChange={e => handleSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT, email..."
              className="w-full h-10 pl-10 pr-4 bg-sg-btn-bg border border-sg-border rounded-xl text-[13px] font-semibold text-sg-heading placeholder:text-sg-muted outline-none focus:border-emerald-500/40 transition-colors"
            />
          </div>

          <select
            value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setFilter(prev => ({ ...prev, status: e.target.value, page: 1 })); }}
            className="h-10 px-4 bg-sg-btn-bg border border-sg-border rounded-xl text-[12px] font-bold text-sg-heading outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
          </select>

          {/* Grid/List Toggle */}
          <div className="flex items-center p-1 bg-sg-btn-bg border border-sg-border rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-sg-card text-emerald-500 shadow-sm border border-sg-border' : 'text-sg-muted hover:text-sg-heading'}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-sg-card text-emerald-500 shadow-sm border border-sg-border' : 'text-sg-muted hover:text-sg-heading'}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ════ CONTENT ════ */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={28} className="text-emerald-500 animate-spin" />
          </div>
        ) : (customers || []).length === 0 ? (
          <EmptyState
            icon={<Users size={40} className="text-blue-500" />}
            title="Đang đồng bộ Khách Hàng"
            description="Hệ thống đang kéo dữ liệu khách hàng mới nhất từ CRM về..."
          />
        ) : viewMode === 'grid' ? (
          /* ═══ GRID VIEW ═══ */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {(customers || []).map((c, idx) => {
              const sCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.COLD;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="relative group perspective-distant sg-stagger cursor-pointer"
                  style={{ animationDelay: `${(idx % 12) * 60}ms` }}
                >
                  <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-sg-2xl border border-slate-200 dark:border-white/5 p-6 flex flex-col gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-700 hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] group-hover:-translate-y-3 relative overflow-hidden">
                    {/* Glass Shimmer */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full ${sCfg.bg} blur-[60px] opacity-20 group-hover:opacity-60 group-hover:scale-125 transition-all duration-1000`} />

                    {/* Header */}
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${sCfg.bg} border ${sCfg.border} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700`}>
                          <span className="text-[16px] font-black">{c.fullName[0]}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[15px] font-black text-sg-heading truncate group-hover:text-emerald-500 transition-colors">{c.fullName}</h4>
                          <span className="text-[10px] font-bold text-sg-muted">{SOURCE_LABELS[c.source] || c.source}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-xs ${sCfg.bg} ${sCfg.color} ${sCfg.border}`}>
                        {sCfg.emoji} {sCfg.label}
                      </span>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-1.5 relative z-10">
                      {c.phone && <div className="flex items-center gap-2 text-[12px] text-sg-muted"><Phone size={12} /> <span className="font-medium">{c.phone}</span></div>}
                      {c.email && <div className="flex items-center gap-2 text-[12px] text-sg-muted"><Mail size={12} /> <span className="font-medium truncate">{c.email}</span></div>}
                    </div>

                    {/* Actions (visible on hover) */}
                    <div className="flex items-center gap-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 pt-2 border-t border-sg-border/20 relative z-10">
                      <button onClick={e => { e.stopPropagation(); setSelectedCustomer(c); }} className="flex-1 h-9 flex items-center justify-center gap-1 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 text-[11px] font-bold hover:bg-blue-500 hover:text-white transition-colors">
                        <Eye size={13} /> Xem Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ═══ LIST VIEW ═══ */
          <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[28px] border border-slate-200/80 dark:border-sg-border shadow-sg-md overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-sg-border/40">
                  <th className="px-5 py-4 text-left text-[10px] font-black text-sg-muted uppercase tracking-widest">Khách hàng</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-sg-muted uppercase tracking-widest">Liên hệ</th>
                  <th className="px-4 py-4 text-center text-[10px] font-black text-sg-muted uppercase tracking-widest">Trạng thái</th>
                  <th className="px-4 py-4 text-left text-[10px] font-black text-sg-muted uppercase tracking-widest">Nguồn</th>
                  <th className="px-4 py-4 text-right text-[10px] font-black text-sg-muted uppercase tracking-widest">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {(customers || []).map((c, idx) => {
                  const sCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.COLD;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className="border-b border-slate-50 dark:border-sg-border/20 hover:bg-sg-card/30 transition-colors cursor-pointer group sg-stagger"
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${sCfg.bg} border ${sCfg.border} flex items-center justify-center flex-shrink-0`}>
                            <span className="text-[13px] font-black">{c.fullName[0]}</span>
                          </div>
                          <div>
                            <span className="block text-[14px] font-bold text-sg-heading group-hover:text-emerald-500 transition-colors">{c.fullName}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {c.phone && <div className="flex items-center gap-1.5 text-[12px] text-sg-muted"><Phone size={11} />{c.phone}</div>}
                        {c.email && <div className="flex items-center gap-1.5 text-[12px] text-sg-muted mt-0.5"><Mail size={11} /><span className="truncate max-w-[160px]">{c.email}</span></div>}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black border ${sCfg.bg} ${sCfg.color} ${sCfg.border}`}>{sCfg.emoji} {sCfg.label}</span>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] font-semibold text-sg-muted">{SOURCE_LABELS[c.source] || c.source}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={e => { e.stopPropagation(); setSelectedCustomer(c); }} className="px-3 h-8 rounded-lg bg-blue-500/10 text-blue-500 text-[11px] font-bold border border-blue-500/20 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">
                            Xem hồ sơ
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ════ CUSTOMER DETAIL DRAWER ════ */}
      <CinematicDrawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.fullName || ''}
        subtitle={selectedCustomer ? (STATUS_CONFIG[selectedCustomer.status]?.label || selectedCustomer.status) : ''}
        icon={selectedCustomer ? <span className="text-[22px] font-black text-blue-500">{selectedCustomer.fullName[0]}</span> : undefined}
        accentColor="blue"
        footer={selectedCustomer ? (
          <button onClick={() => { toast.info('Chuyển hướng', 'Đang mở hồ sơ trên Bizfly CRM...'); }} className="w-full h-14 flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[14px] font-black text-sg-heading transition-all hover:-translate-y-1 hover:bg-slate-200 dark:hover:bg-white/10">
            Khách hàng quản lý bởi Bizfly CRM ↗
          </button>
        ) : undefined}
      >
        {selectedCustomer && (
          <>
            <DrawerHeroCard gradient="from-blue-500/10 to-indigo-500/5" borderColor="border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={14} className="text-blue-500" />
                <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Thông tin khách hàng</span>
              </div>
              <h3 className="text-[28px] font-black text-sg-heading tracking-tight">{selectedCustomer.fullName}</h3>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${STATUS_CONFIG[selectedCustomer.status]?.bg} ${STATUS_CONFIG[selectedCustomer.status]?.color} ${STATUS_CONFIG[selectedCustomer.status]?.border}`}>
                  {STATUS_CONFIG[selectedCustomer.status]?.emoji} {STATUS_CONFIG[selectedCustomer.status]?.label}
                </span>
                <span className="text-[11px] font-bold text-sg-muted">{SOURCE_LABELS[selectedCustomer.source]}</span>
              </div>
            </DrawerHeroCard>

            <DrawerSection title="Liên Hệ" icon={<Phone size={14} className="text-blue-500" />}>
              <div className="grid grid-cols-1 gap-4">
                <DrawerDetailRow icon={<Phone size={16} className="text-emerald-500" />} label="Số điện thoại" value={selectedCustomer.phone || 'Chưa có'} />
                <DrawerDetailRow icon={<Mail size={16} className="text-blue-500" />} label="Email" value={selectedCustomer.email || 'Chưa có'} />
                <DrawerDetailRow icon={<MapPin size={16} className="text-amber-500" />} label="Địa chỉ" value={selectedCustomer.address || 'Chưa có'} />
                <DrawerDetailRow icon={<Briefcase size={16} className="text-violet-500" />} label="Công ty" value={selectedCustomer.company || 'Cá nhân'} />
              </div>
            </DrawerSection>

            {selectedCustomer.notes && (
              <DrawerSection title="Ghi Chú" icon={<Edit2 size={14} className="text-amber-500" />}>
                <p className="text-[13px] font-medium text-sg-heading leading-relaxed">{selectedCustomer.notes}</p>
              </DrawerSection>
            )}
          </>
        )}
      </CinematicDrawer>

    </div>
  );
}
