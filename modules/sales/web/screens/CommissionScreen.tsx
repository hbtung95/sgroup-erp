import React, { useState, useMemo } from 'react';
import {
  DollarSign, Users, TrendingUp, Filter, Download, ChevronDown,
  CheckCircle2, Clock, AlertCircle, Banknote, Award, Building2
} from 'lucide-react';
import * as M from '../api/salesMocks';

// ═══════════════════════════════════════════════════════════
// COMMISSION SCREEN — Bảng Tính Hoa Hồng
// Neo-Glassmorphism v2.2 • sg-stagger animations
// ═══════════════════════════════════════════════════════════

type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL';

interface CommissionRow {
  id: string;
  dealCode: string;
  projectName: string;
  productCode: string;
  customerName: string;
  dealValue: number;
  feeRate: number;
  totalCommission: number;
  staffName: string;
  staffShare: number;   // 60%
  leaderShare: number;  // 15%
  managerShare: number; // 15%
  directorShare: number; // 10%
  status: PaymentStatus;
  closedAt: string;
}

const SPLIT = { staff: 0.60, leader: 0.15, manager: 0.15, director: 0.10 };

const STATUS_MAP: Record<PaymentStatus, { label: string; color: string; bg: string; icon: any }> = {
  PAID:    { label: 'Đã chi', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  PARTIAL: { label: 'Chi 1 phần', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
  PENDING: { label: 'Chưa chi', color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertCircle },
};

const formatVND = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)} Tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} Tr`;
  return Math.round(n).toLocaleString('vi-VN');
};

// Generate commission data from mock deals
const generateCommissionData = (): CommissionRow[] => {
  return M.MOCK_DEALS
    .filter(d => d.stage === 'CLOSED' || d.stage === 'CONTRACT' || d.stage === 'DEPOSIT' || d.dealValue > 0)
    .map((deal, i) => {
      const totalComm = deal.dealValue * ((deal.feeRate || 3) / 100);
      return {
        id: `CM-${i + 1}`,
        dealCode: deal.dealCode,
        projectName: deal.projectName || 'SGroup Royal City',
        productCode: deal.productCode,
        customerName: deal.customerName,
        dealValue: deal.dealValue,
        feeRate: deal.feeRate || 3,
        totalCommission: totalComm,
        staffName: deal.staffName || 'N/A',
        staffShare: totalComm * SPLIT.staff,
        leaderShare: totalComm * SPLIT.leader,
        managerShare: totalComm * SPLIT.manager,
        directorShare: totalComm * SPLIT.director,
        status: (['PAID', 'PENDING', 'PARTIAL', 'PAID', 'PENDING'] as PaymentStatus[])[i % 5],
        closedAt: deal.updatedAt || '2026-04-12',
      };
    });
};

export function CommissionScreen() {
  const [data] = useState<CommissionRow[]>(generateCommissionData);
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | 'ALL'>('ALL');
  const [selectedMonth] = useState(4);

  const filtered = useMemo(() => {
    if (filterStatus === 'ALL') return data;
    return data.filter(r => r.status === filterStatus);
  }, [data, filterStatus]);

  const totals = useMemo(() => ({
    totalComm: data.reduce((s, r) => s + r.totalCommission, 0),
    totalPaid: data.filter(r => r.status === 'PAID').reduce((s, r) => s + r.totalCommission, 0),
    totalPending: data.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.totalCommission, 0),
    dealCount: data.length,
  }), [data]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 lg:px-8 py-5 border-b border-slate-200/50 dark:border-sg-border/40 bg-white/40 dark:bg-black/20 backdrop-blur-xl shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-linear-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <DollarSign size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-sg-heading tracking-tight">Bảng Tính Hoa Hồng</h2>
              <span className="text-[12px] font-bold text-sg-muted flex items-center gap-2 mt-0.5">
                <Banknote size={14} /> Tháng {selectedMonth}/2026 • {data.length} giao dịch
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/50 dark:bg-white/5 border border-sg-border rounded-xl text-[12px] font-bold text-sg-heading hover:bg-sg-card transition-colors">
              <Download size={14} /> Xuất Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-6 lg:px-8 pt-6 pb-0 shrink-0">
        <div className="grid grid-cols-4 gap-4">
          <SummaryCard icon={<DollarSign size={20} />} label="Tổng Hoa Hồng" value={formatVND(totals.totalComm)} color="text-amber-500" gradient="from-amber-500/15 to-orange-500/5" />
          <SummaryCard icon={<CheckCircle2 size={20} />} label="Đã Chi Trả" value={formatVND(totals.totalPaid)} color="text-emerald-500" gradient="from-emerald-500/15 to-green-500/5" />
          <SummaryCard icon={<Clock size={20} />} label="Chờ Chi Trả" value={formatVND(totals.totalPending)} color="text-rose-500" gradient="from-rose-500/15 to-pink-500/5" />
          <SummaryCard icon={<TrendingUp size={20} />} label="Deals Chốt" value={`${totals.dealCount}`} color="text-indigo-500" gradient="from-indigo-500/15 to-violet-500/5" />
        </div>
      </div>

      {/* Commission Split Legend */}
      <div className="px-6 lg:px-8 py-4 shrink-0">
        <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-slate-200/50 dark:border-sg-border/40">
          <span className="text-[11px] font-black text-sg-muted uppercase tracking-widest">CHIA HOA HỒNG:</span>
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[12px] font-bold"><span className="w-3 h-3 rounded-full bg-emerald-500" /> Staff <span className="font-black text-emerald-500">60%</span></span>
            <span className="flex items-center gap-1.5 text-[12px] font-bold"><span className="w-3 h-3 rounded-full bg-blue-500" /> Leader <span className="font-black text-blue-500">15%</span></span>
            <span className="flex items-center gap-1.5 text-[12px] font-bold"><span className="w-3 h-3 rounded-full bg-violet-500" /> Manager <span className="font-black text-violet-500">15%</span></span>
            <span className="flex items-center gap-1.5 text-[12px] font-bold"><span className="w-3 h-3 rounded-full bg-amber-500" /> Director <span className="font-black text-amber-500">10%</span></span>
          </div>
          <div className="ml-auto flex gap-2">
            {(['ALL', 'PAID', 'PENDING', 'PARTIAL'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wide transition-all ${
                  filterStatus === s ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'text-sg-muted hover:text-sg-heading border border-transparent'
                }`}
              >
                {s === 'ALL' ? 'Tất cả' : STATUS_MAP[s].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto px-6 lg:px-8 pb-6">
        <div className="bg-white/60 dark:bg-sg-card backdrop-blur-2xl rounded-[20px] border border-slate-200/60 dark:border-sg-border shadow-sg-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-sg-border bg-slate-50/80 dark:bg-black/20">
                <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest">Deal</th>
                <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest">Sản Phẩm</th>
                <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest">Khách Hàng</th>
                <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest text-right">Giá Trị GD</th>
                <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest text-center">%</th>
                <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest text-right">Hoa Hồng</th>
                <th className="px-5 py-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-right">Staff</th>
                <th className="px-5 py-4 text-[10px] font-black text-blue-500 uppercase tracking-widest text-right">Leader</th>
                <th className="px-5 py-4 text-[10px] font-black text-violet-500 uppercase tracking-widest text-right">Manager</th>
                <th className="px-5 py-4 text-[10px] font-black text-sg-muted uppercase tracking-widest text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => {
                const st = STATUS_MAP[row.status];
                const Icon = st.icon;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100/80 dark:border-sg-border/30 hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors sg-stagger"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-5 py-4">
                      <div className="text-[13px] font-black text-sg-heading">{row.dealCode}</div>
                      <div className="text-[10px] font-bold text-sg-muted">{row.staffName}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[12px] font-bold text-sg-heading">{row.productCode}</div>
                      <div className="text-[10px] text-sg-muted">{row.projectName}</div>
                    </td>
                    <td className="px-5 py-4 text-[12px] font-bold text-sg-heading">{row.customerName}</td>
                    <td className="px-5 py-4 text-[13px] font-black text-sg-heading text-right">{formatVND(row.dealValue)}</td>
                    <td className="px-5 py-4 text-[13px] font-black text-amber-500 text-center">{row.feeRate}%</td>
                    <td className="px-5 py-4 text-[14px] font-black text-amber-600 dark:text-amber-400 text-right">{formatVND(row.totalCommission)}</td>
                    <td className="px-5 py-4 text-[12px] font-black text-emerald-500 text-right">{formatVND(row.staffShare)}</td>
                    <td className="px-5 py-4 text-[12px] font-black text-blue-500 text-right">{formatVND(row.leaderShare)}</td>
                    <td className="px-5 py-4 text-[12px] font-black text-violet-500 text-right">{formatVND(row.managerShare)}</td>
                    <td className="px-5 py-4">
                      <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg ${st.bg} ${st.color} text-[11px] font-black`}>
                        <Icon size={12} /> {st.label}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center">
              <DollarSign size={40} className="text-sg-muted/30 mb-3" />
              <p className="text-[14px] font-bold text-sg-muted">Không có dữ liệu hoa hồng phù hợp.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color, gradient }: { icon: React.ReactNode; label: string; value: string; color: string; gradient: string }) {
  return (
    <div className={`bg-white/60 dark:bg-sg-card backdrop-blur-2xl rounded-[20px] border border-slate-200/60 dark:border-sg-border p-5 shadow-sg-sm relative overflow-hidden sg-stagger`}>
      <div className={`absolute inset-0 bg-linear-to-br ${gradient} pointer-events-none`} />
      <div className="relative z-10 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-white/80 dark:bg-black/30 border border-sg-border/50 flex items-center justify-center ${color}`}>{icon}</div>
        <div>
          <p className="text-[11px] font-bold text-sg-muted uppercase tracking-wider">{label}</p>
          <p className={`text-[22px] font-black ${color} leading-tight mt-0.5`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
