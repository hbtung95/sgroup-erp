import React, { useState, useCallback } from 'react';
import {
  Layers, Clock, Lock, Banknote, CheckCircle2, XCircle,
  ChevronRight, Loader2, RefreshCw, Plus, Filter,
  DollarSign, User, Calendar, Building2, MapPin, Phone,
} from 'lucide-react';
import { useTransactions, useTransactionActions, formatVND } from '../hooks/useSalesData';
import { CURRENT_USER, CURRENT_TEAM } from '../api/salesMocks';
import type { Transaction } from '../api/salesApi';
import {
  CinematicDrawer, DrawerSection, DrawerHeroCard, DrawerDetailRow,
  DrawerActionButton, EmptyState, SkeletonCard,
} from '../components/shared';
import { useToastActions } from '../components/shared/Toast';
import { useSalesRole } from '../components/shared/RoleContext';

// ═══════════════════════════════════════════════════════════
// TRANSACTION BOARD — Kanban + Detail Drawer + Toast
// Neo-Glassmorphism v2.2 • sg-stagger animations
// ═══════════════════════════════════════════════════════════

type ColumnKey = 'PENDING_LOCK' | 'LOCKED' | 'DEPOSIT' | 'SOLD';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  glowColor: string;
  gradient: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: 'PENDING_LOCK', label: 'Chờ Duyệt',  icon: <Clock size={16} />,         color: 'text-amber-500',   borderColor: 'border-amber-500/20', glowColor: 'bg-amber-500', gradient: 'from-amber-400 to-amber-600' },
  { key: 'LOCKED',       label: 'Đã Lock',     icon: <Lock size={16} />,          color: 'text-blue-500',    borderColor: 'border-blue-500/20',  glowColor: 'bg-blue-500',  gradient: 'from-blue-400 to-blue-600' },
  { key: 'DEPOSIT',      label: 'Đã Cọc',      icon: <Banknote size={16} />,      color: 'text-orange-500',  borderColor: 'border-orange-500/20', glowColor: 'bg-orange-500', gradient: 'from-orange-400 to-orange-600' },
  { key: 'SOLD',         label: 'Đã Bán',      icon: <CheckCircle2 size={16} />,  color: 'text-emerald-500', borderColor: 'border-emerald-500/20', glowColor: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-600' },
];

export function TransactionBoardScreen({ mode = 'personal' }: { mode?: 'personal' | 'team' }) {
  const { role } = useSalesRole();
  const { data: transactions, loading, refetch } = useTransactions({ limit: 200 });
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const toast = useToastActions();

  const groupedTx = COLUMNS.map(col => {
    let rawItems = (transactions || []).filter(tx => tx.status === col.key);
    
    // Quick personal/team filter logic (mocked schema using staffId)
    // Note: Transaction schema from mock API may not have teamName/staffName so we'll mock filtering by staffId/teamId as best effort
    if (mode === 'personal' || role === 'sales_staff') {
      rawItems = rawItems.filter(tx => tx.salesStaffId === CURRENT_USER.id);
    } else if (mode === 'team' && role === 'sales_manager') {
      // In a real API, the transaction object would have a teamId or the BFF filters it.
      rawItems = rawItems.filter(tx => tx.salesStaffId === CURRENT_USER.id || true); // Assuming rawItems is already filtered for the team in Mocks, or add team logic
    }

    return {
      ...col,
      items: rawItems,
    };
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 lg:px-8 py-5 border-b border-slate-100 dark:border-sg-border/40 bg-white/40 dark:bg-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Layers size={18} className="text-indigo-500" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-sg-heading">
                {mode === 'team' ? 'Transaction Pipeline Team' : 'Transaction Pipeline'}
              </h2>
              <span className="text-[11px] font-bold text-sg-muted">
                {mode === 'team' ? 'Dữ liệu toàn đội • ' : 'Dữ liệu cá nhân • '}
                {(transactions || []).length} giao dịch đang xử lý
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2.5 bg-sg-btn-bg border border-sg-border rounded-xl text-[12px] font-bold text-sg-muted hover:text-sg-heading transition-colors">
              <RefreshCw size={14} /> Làm mới
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[12px] font-black pointer-events-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Đồng bộ từ CRM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4 lg:p-6">
        {loading ? (
          <div className="grid grid-cols-4 gap-4 h-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 h-full min-w-[900px]">
            {groupedTx.map((col, colIdx) => (
              <div key={col.key} className="flex flex-col sg-stagger" style={{ animationDelay: `${colIdx * 60}ms` }}>
                {/* Column header */}
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl border mb-3 ${col.borderColor} bg-white/60 dark:bg-black/30 backdrop-blur-xl`}>
                  <div className="flex items-center gap-2">
                    <span className={col.color}>{col.icon}</span>
                    <span className="text-[13px] font-black text-sg-heading">{col.label}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${col.color} bg-sg-card/50`}>
                    {col.items.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 space-y-3 overflow-y-auto pb-4 custom-scrollbar">
                  {col.items.map((tx, idx) => (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[20px] border border-slate-200/80 dark:border-sg-border p-4 shadow-sg-sm hover:shadow-sg-md hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden sg-stagger"
                      style={{ animationDelay: `${colIdx * 60 + idx * 40}ms` }}
                    >
                      {/* Glass shimmer */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full ${col.glowColor}/10 blur-2xl opacity-0 group-hover:opacity-60 transition-opacity`} />

                      {/* Unit code */}
                      <div className="flex items-center justify-between mb-2.5 relative z-10">
                        <span className="text-[14px] font-black text-sg-heading group-hover:text-emerald-500 transition-colors">{tx.unitCode}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${col.color} bg-sg-card/50 border ${col.borderColor}`}>{col.label}</span>
                      </div>

                      <div className="flex flex-col gap-1 text-[12px] font-semibold text-sg-muted mb-2 relative z-10">
                        <div className="flex items-center gap-2">
                          <User size={12} /> <span className="truncate">{tx.customerName || 'Chưa có KH'}</span>
                        </div>
                        {mode === 'team' && (
                          <div className="flex items-center gap-2 mt-1 py-1 px-2 bg-indigo-50/50 dark:bg-white/5 rounded-md inline-flex w-fit max-w-full">
                            <User size={10} className="text-indigo-500" /> 
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 truncate tracking-wide">{(tx as any).staffName || CURRENT_USER.fullName}</span>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-[13px] font-black text-emerald-500">{formatVND(tx.price)}</span>
                        {tx.commission > 0 && (
                          <span className="text-[10px] font-bold text-sg-muted">HH: {formatVND(tx.commission)}</span>
                        )}
                      </div>

                    </div>
                  ))}

                  {/* Empty column */}
                  {col.items.length === 0 && (
                    <div className="flex-1 flex items-center justify-center p-8 rounded-[20px] border-2 border-dashed border-sg-border/30 text-center min-h-[200px]">
                      <div>
                        <div className={`w-12 h-12 mx-auto rounded-xl ${col.glowColor}/10 flex items-center justify-center mb-3`}>
                          <span className={`${col.color} opacity-30`}>{col.icon}</span>
                        </div>
                        <p className="text-[12px] font-bold text-sg-muted">Chưa có giao dịch</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════ TRANSACTION DETAIL DRAWER ════ */}
      <CinematicDrawer
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title={selectedTx?.unitCode || ''}
        subtitle={selectedTx ? COLUMNS.find(c => c.key === selectedTx.status)?.label : ''}
        icon={selectedTx ? <DollarSign size={24} className="text-emerald-500" /> : undefined}
        accentColor={selectedTx?.status === 'SOLD' ? 'emerald' : selectedTx?.status === 'DEPOSIT' ? 'orange' : 'blue'}
        footer={selectedTx ? (
          <button onClick={() => { toast.info('Chuyển hướng', 'Đang mở giao dịch trên Bizfly CRM...'); }} className="w-full h-14 flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[14px] font-black text-sg-heading transition-all hover:-translate-y-1 hover:bg-slate-200 dark:hover:bg-white/10">
            Giao dịch quản lý bởi Bizfly CRM ↗
          </button>
        ) : undefined}
      >
        {selectedTx && (
          <>
            {/* Price Hero */}
            <DrawerHeroCard>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-emerald-500" />
                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Giá trị giao dịch</span>
              </div>
              <div className="text-[36px] font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400 leading-tight">
                {(selectedTx.price / 1000000000).toFixed(2)} <span className="text-[18px]">Tỷ VNĐ</span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-emerald-500/10">
                <div><span className="text-[10px] font-bold text-sg-muted uppercase">Hoa hồng</span><br /><span className="text-[15px] font-black text-emerald-500">{formatVND(selectedTx.commission)}</span></div>
                <div className="text-right"><span className="text-[10px] font-bold text-sg-muted uppercase">Trạng thái</span><br />
                  <span className={`text-[15px] font-black ${COLUMNS.find(c => c.key === selectedTx.status)?.color}`}>
                    {COLUMNS.find(c => c.key === selectedTx.status)?.label}
                  </span>
                </div>
              </div>
            </DrawerHeroCard>

            {/* Customer Info */}
            <DrawerSection title="Thông Tin Giao Dịch" icon={<User size={14} className="text-blue-500" />}>
              <div className="grid grid-cols-1 gap-4">
                <DrawerDetailRow icon={<User size={16} className="text-blue-500" />} label="Khách hàng" value={selectedTx.customerName || 'Chưa có'} />
                <DrawerDetailRow icon={<Building2 size={16} className="text-indigo-500" />} label="Mã căn" value={selectedTx.unitCode} />
                <DrawerDetailRow icon={<MapPin size={16} className="text-amber-500" />} label="Dự án" value={selectedTx.projectName || 'N/A'} />
                <DrawerDetailRow icon={<Calendar size={16} className="text-violet-500" />} label="Ngày tạo" value={selectedTx.createdAt ? new Date(selectedTx.createdAt).toLocaleDateString('vi-VN') : 'N/A'} />
              </div>
            </DrawerSection>
          </>
        )}
      </CinematicDrawer>
    </div>
  );
}
