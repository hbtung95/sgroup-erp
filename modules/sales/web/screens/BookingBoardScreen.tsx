import React, { useState, useEffect, useCallback } from 'react';
import {
  BookmarkPlus, Clock, Lock, CheckCircle2,
  XCircle, RefreshCw, User, DollarSign, Building2, Plus, Phone, Edit3
} from 'lucide-react';
import { useSalesRole } from '../components/shared/RoleContext';
import { salesOpsApi } from '../api/salesApi';
import { CURRENT_USER, CURRENT_TEAM } from '../api/salesMocks';
import {
  CinematicDrawer, DrawerSection, DrawerHeroCard, DrawerDetailRow,
  SkeletonCard,
} from '../components/shared';
import { BookingEntryModal } from '../components/BookingEntryModal';
import { formatVND } from '../hooks/useSalesData';

// ═══════════════════════════════════════════════════════════
// BOOKING BOARD SCREEN — Productivity Tracking
// Neo-Glassmorphism v2.2 • sg-stagger animations
// ═══════════════════════════════════════════════════════════

export interface BookingBoardItem {
  id: string;
  projectName?: string;
  unitCode?: string;
  customerName?: string;
  customerPhone?: string;
  status?: string;
  staffName?: string;
  teamName?: string;
  bookingAmount: number;
  [key: string]: unknown;
}

const COLUMNS = [
  { key: 'PENDING',  label: 'Chờ Duyệt',     icon: <Clock size={16} />,        color: 'text-amber-500',   borderColor: 'border-amber-500/20', glowColor: 'bg-amber-500' },
  { key: 'APPROVED', label: 'Đã Duyệt',      icon: <CheckCircle2 size={16} />, color: 'text-emerald-500', borderColor: 'border-emerald-500/20', glowColor: 'bg-emerald-500' },
  { key: 'REJECTED', label: 'Từ Chối',       icon: <XCircle size={16} />,      color: 'text-rose-500',    borderColor: 'border-rose-500/20',  glowColor: 'bg-rose-500' },
];

export function BookingBoardScreen({ mode = 'personal' }: { mode?: 'personal' | 'team' }) {
  const { role } = useSalesRole();
  const [items, setItems] = useState<BookingBoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<BookingBoardItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<BookingBoardItem | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesOpsApi.listBookings();
      let data = res.data as unknown as BookingBoardItem[];
      
      // Personal mode: only show current user's items
      if (mode === 'personal' || role === 'sales_staff') {
        data = data.filter((item) => item.staffName === CURRENT_USER.fullName);
      } 
      // Team mode: show team items (Manager) or all items (Director)
      else if (mode === 'team') {
        if (role === 'sales_manager') {
          data = data.filter((item) => item.teamName === CURRENT_TEAM.name || item.staffName === CURRENT_USER.fullName);
        }
        // Director sees everything, no filter needed
      }
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const grouped = COLUMNS.map(col => ({
    ...col,
    items: items.filter(i => (i.status || 'PENDING') === col.key),
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 lg:px-8 py-5 border-b border-slate-100 dark:border-sg-border/40 bg-white/40 dark:bg-black/20 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <BookmarkPlus size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-sg-heading">
                {mode === 'team' ? 'Quản Lý Giữ Chỗ Team' : 'Giữ Chỗ Đang Mở'}
              </h2>
              <span className="text-[11px] font-bold text-sg-muted">
                {mode === 'team' ? 'Dữ liệu toàn đội • ' : 'Dữ liệu cá nhân • '}
                {(items || []).length} mục chờ xử lý
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchItems} className="flex items-center gap-2 px-4 py-2.5 bg-sg-btn-bg border border-sg-border rounded-xl text-[12px] font-bold text-sg-muted hover:text-sg-heading transition-colors">
              <RefreshCw size={14} /> Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4 lg:p-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-6 h-full">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6 h-full min-w-[800px]">
            {grouped.map((col, colIdx) => (
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
                  {col.items.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[20px] border border-slate-200/80 dark:border-sg-border p-4 shadow-sg-sm hover:shadow-sg-md hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden sg-stagger"
                      style={{ animationDelay: `${colIdx * 60 + idx * 40}ms` }}
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full ${col.glowColor}/10 blur-2xl opacity-0 group-hover:opacity-60 transition-opacity`} />

                      <div className="flex items-center justify-between mb-2.5 relative z-10">
                        <span className="text-[14px] font-black text-sg-heading group-hover:text-blue-500 transition-colors">{item.projectName || 'Chưa có dự án'}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${col.color} bg-sg-card/50 border ${col.borderColor}`}>{col.label}</span>
                      </div>

                      <div className="flex flex-col gap-1 text-[12px] font-semibold text-sg-muted mb-2 relative z-10">
                        <div className="flex items-center gap-2">
                          <User size={12} /> <span className="truncate">{item.customerName || 'Chưa có KH'}</span>
                        </div>
                        {item.customerPhone && (
                          <div className="flex items-center gap-2 opacity-80">
                            <Phone size={11} className="text-sg-muted" /> <span className="font-mono text-[11px] font-medium tracking-wider">{item.customerPhone}</span>
                          </div>
                        )}
                        {mode === 'team' && (
                          <div className="flex items-center gap-2 mt-1 py-1 px-2 bg-blue-50/50 dark:bg-white/5 rounded-md inline-flex w-fit max-w-full">
                            <User size={10} className="text-blue-500" /> 
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 truncate tracking-wide">{item.staffName || 'N/A'}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between relative z-10 mt-3 pt-3 border-t border-sg-border border-dashed">
                        <div>
                          <span className="text-[10px] font-bold text-sg-muted uppercase">Số tiền</span>
                          <p className="text-[13px] font-black text-blue-500">{formatVND(item.bookingAmount)}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-sg-muted uppercase">Nhân sự</span>
                          <p className="text-[12px] font-black text-sg-heading">{item.staffName || '---'}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty state */}
                  {col.items.length === 0 && (
                    <div className="flex-1 flex items-center justify-center p-8 rounded-[20px] border-2 border-dashed border-sg-border/30 text-center min-h-[150px]">
                      <div>
                        <p className="text-[12px] font-bold text-sg-muted">Trống</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <CinematicDrawer
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.projectName || 'Chi tiết Booking'}
        subtitle={selectedItem ? COLUMNS.find(c => c.key === selectedItem.status)?.label : ''}
        icon={selectedItem ? <BookmarkPlus size={24} className="text-blue-500" /> : undefined}
      >
        {selectedItem && (
          <>
            <DrawerHeroCard>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-blue-500" />
                <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Tiền Giữ Chỗ (Booking)</span>
              </div>
              <div className="text-[32px] font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400 leading-tight">
                {formatVND(selectedItem.bookingAmount)}
              </div>
              <div className="mt-4 pt-4 border-t border-blue-500/10">
                <span className={`px-2 py-1 rounded text-[11px] font-black ${COLUMNS.find(c => c.key === selectedItem.status)?.color} bg-sg-card border ${COLUMNS.find(c => c.key === selectedItem.status)?.borderColor}`}>
                  Trạng thái: {COLUMNS.find(c => c.key === selectedItem.status)?.label}
                </span>
              </div>
            </DrawerHeroCard>

            <DrawerSection title="Chi Tiết Booking" icon={<Building2 size={14} className="text-blue-500" />}>
              <div className="grid grid-cols-1 gap-4">
                <DrawerDetailRow icon={<User size={16} className="text-indigo-500" />} label="Khách hàng" value={selectedItem.customerName} />
                {selectedItem.customerPhone && (
                  <DrawerDetailRow icon={<Phone size={16} className="text-emerald-500" />} label="Số thiết bị (SĐT)" value={selectedItem.customerPhone} />
                )}
                <DrawerDetailRow icon={<Building2 size={16} className="text-blue-500" />} label="Dự án" value={selectedItem.projectName} />
                <DrawerDetailRow icon={<User size={16} className="text-amber-500" />} label="Nhân viên QL" value={selectedItem.staffName} />
              </div>
            </DrawerSection>

            {selectedItem.status === 'PENDING' && selectedItem.staffName === CURRENT_USER.fullName && (
              <div className="mt-8 px-4">
                <button
                  onClick={() => {
                    setEditItem(selectedItem);
                    setIsModalOpen(true);
                    setSelectedItem(null); // Close drawer to open modal cleanly
                  }}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-sg-card/60 hover:bg-blue-500 focus:bg-blue-600 text-sg-heading hover:text-white border border-sg-border/50 hover:border-blue-500/50 shadow-sm transition-all font-bold text-[14px]"
                >
                  <Edit3 size={16} /> Chỉnh sửa phiếu này
                </button>
              </div>
            )}
          </>
        )}
      </CinematicDrawer>

      {/* FAB */}
      <button
        onClick={() => { setEditItem(null); setIsModalOpen(true); }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-linear-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/40 hover:-translate-y-1 hover:shadow-blue-500/60 flex items-center justify-center transition-all z-40 sg-stagger group"
        style={{ animationDelay: '800ms' }}
      >
        <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <BookingEntryModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditItem(null); }} 
        onSuccess={fetchItems}
        editData={editItem}
      />
    </div>
  );
}
