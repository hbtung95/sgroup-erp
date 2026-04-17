import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Building2, Award, Calendar,
  Edit3, Camera, Shield, Star, TrendingUp, Target, Briefcase,
  CheckCircle2, Clock, FileText, Activity, ChevronRight, Save, X
} from 'lucide-react';
import * as M from '../api/salesMocks';
import { useToastActions } from '../components/shared/Toast';
import { useSalesRole } from '../components/shared/RoleContext';

// ═══════════════════════════════════════════════════════════
// PROFILE SCREEN — Hồ Sơ Cá Nhân Sales
// Neo-Glassmorphism v2.2 • sg-stagger animations
// ═══════════════════════════════════════════════════════════

const formatVND = (n: number) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} Tỷ`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} Tr`;
  return n.toLocaleString('vi-VN');
};

import { CURRENT_USER as MOCK_USER, CURRENT_TEAM as MOCK_TEAM } from '../api/salesMocks';

// ═══ Personal Profile Mock Data ═══
const CURRENT_USER = {
  id: MOCK_USER.id,
  employeeCode: MOCK_USER.employeeCode || 'SG-2025-001',
  fullName: MOCK_USER.fullName,
  email: MOCK_USER.email || 'user@sgroup.vn',
  phone: MOCK_USER.phone || '0901 234 567',
  address: '123 Nguyễn Huệ, Q.1, TP.HCM',
  dateOfBirth: '1995-06-15',
  gender: 'male' as const,
  idCard: '079 095 001 234',
  bankAccount: '1234 5678 9012',
  bankName: 'Vietcombank - CN Sài Gòn',
  taxCode: '0123456789',
  joinDate: '2025-01-15',
  department: 'Phòng Kinh Doanh',
  team: MOCK_TEAM.name,
  position: 'Chuyên Viên Kinh Doanh',
  contractType: 'Toàn thời gian',
  contractExpiry: '2027-01-15',
  emergencyContact: 'Trần Thị B - 0912 345 678 (Mẹ)',
  avatar: null as string | null,
};

// KPI Summary
const MY_KPI = {
  totalDeals: 24,
  closedDeals: 8,
  revenue: 12500000000,
  target: 20000000000,
  activityPoints: 2850,
  pointsTarget: 4000,
  bookings: 12,
  deposits: 5,
  rank: 3,
  totalStaff: 45,
};

// Recent activities
const RECENT_ACTIVITIES = [
  { id: 1, type: 'activity', title: 'Nhật ký tác nghiệp', desc: '+45 điểm (3 cuộc gọi, 2 bài đăng)', time: '2 giờ trước', icon: Activity, color: 'text-indigo-500' },
  { id: 2, type: 'booking', title: 'Giữ chỗ căn A05.08', desc: 'SGroup Royal City - Khách: Trần Lê Hải', time: '5 giờ trước', icon: CheckCircle2, color: 'text-blue-500' },
  { id: 3, type: 'deposit', title: 'Thu cọc căn B03.02', desc: '200 triệu - Khách: Ngô Thị Vàng', time: '1 ngày trước', icon: TrendingUp, color: 'text-emerald-500' },
  { id: 4, type: 'activity', title: 'Nhật ký tác nghiệp', desc: '+80 điểm (1 site visit, 5 cuộc gọi)', time: '1 ngày trước', icon: Activity, color: 'text-indigo-500' },
  { id: 5, type: 'meeting', title: 'Hẹn tư vấn khách hàng', desc: 'Lâm Chấn Phong - Dự án Royal City', time: '2 ngày trước', icon: Calendar, color: 'text-amber-500' },
];

export function ProfileScreen() {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(CURRENT_USER);
  const toast = useToastActions();
  const { role } = useSalesRole();

  const revenuePercent = Math.min(100, (MY_KPI.revenue / MY_KPI.target) * 100);
  const pointsPercent = Math.min(100, (MY_KPI.activityPoints / MY_KPI.pointsTarget) * 100);

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Cập nhật hồ sơ thành công!');
  };

  const handleCancel = () => {
    setEditData(CURRENT_USER);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto p-6 lg:p-8 space-y-6">

        {/* ═══ HERO CARD — Avatar + Basic Info ═══ */}
        <div className="bg-white/60 dark:bg-sg-card backdrop-blur-2xl rounded-sg-xl border border-slate-200/60 dark:border-sg-border shadow-sg-sm overflow-hidden sg-stagger relative">
          {/* Gradient Banner */}
          <div className="h-36 bg-linear-to-r from-emerald-500 via-teal-500 to-amber-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-30" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-white/60 dark:from-sg-card to-transparent" />
          </div>
          
          {/* Avatar + Info overlay */}
          <div className="px-8 pb-8 -mt-16 relative z-10 flex items-end gap-6">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-[22px] bg-linear-to-br from-emerald-400 to-amber-500 p-1 shadow-2xl shadow-emerald-500/20">
                <div className="w-full h-full rounded-[18px] bg-white dark:bg-sg-card flex items-center justify-center overflow-hidden">
                  <span className="text-[40px] font-black text-emerald-500">N</span>
                </div>
              </div>
              <button className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl bg-white dark:bg-sg-card border-2 border-white dark:border-sg-border shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                <Camera size={14} className="text-sg-muted" />
              </button>
            </div>

            {/* Name & Role */}
            <div className="flex-1 pb-1">
              <h1 className="text-[26px] font-black text-sg-heading tracking-tight">{CURRENT_USER.fullName}</h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[12px] font-black">{CURRENT_USER.position}</span>
                <span className="text-[12px] font-bold text-sg-muted">•</span>
                <span className="text-[12px] font-bold text-sg-muted">{CURRENT_USER.team}</span>
                <span className="text-[12px] font-bold text-sg-muted">•</span>
                <span className="text-[12px] font-bold text-sg-muted">{CURRENT_USER.employeeCode}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pb-1 shrink-0">
              {isEditing ? (
                <div className="flex gap-2">
                  <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-sg-border bg-white dark:bg-sg-card text-[12px] font-bold text-sg-muted hover:text-rose-500 transition-colors">
                    <X size={14} /> Huỷ
                  </button>
                  <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[12px] font-black transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20">
                    <Save size={14} /> Lưu Thay Đổi
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[12px] font-black transition-all hover:-translate-y-0.5 shadow-lg">
                  <Edit3 size={14} /> Chỉnh Sửa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ═══ KPI SUMMARY ROW ═══ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sg-stagger" style={{ animationDelay: '80ms' }}>
          <KPICard icon={<TrendingUp size={20} />} label="Doanh Thu" value={formatVND(MY_KPI.revenue)} sub={`/${formatVND(MY_KPI.target)} KPI`} color="emerald" percent={revenuePercent} />
          <KPICard icon={<Activity size={20} />} label="Điểm Năng Suất" value={MY_KPI.activityPoints.toLocaleString()} sub={`/${MY_KPI.pointsTarget.toLocaleString()} KPI`} color="indigo" percent={pointsPercent} />
          <KPICard icon={<Target size={20} />} label="Deals Chốt" value={`${MY_KPI.closedDeals}/${MY_KPI.totalDeals}`} sub={`Conv. ${((MY_KPI.closedDeals / MY_KPI.totalDeals) * 100).toFixed(0)}%`} color="amber" percent={(MY_KPI.closedDeals / MY_KPI.totalDeals) * 100} />
          <KPICard icon={<Star size={20} />} label="Xếp Hạng" value={`#${MY_KPI.rank}`} sub={`Trong ${MY_KPI.totalStaff} nhân viên`} color="rose" percent={(1 - MY_KPI.rank / MY_KPI.totalStaff) * 100} />
        </div>

        {/* ═══ MAIN CONTENT: 2-COLUMN LAYOUT ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT — Personal Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Info */}
            <InfoSection title="Thông Tin Liên Hệ" icon={<Phone size={16} className="text-blue-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoField icon={<Mail size={14} />} label="Email" value={editData.email} editable={isEditing} onChange={v => setEditData(e => ({ ...e, email: v }))} />
                <InfoField icon={<Phone size={14} />} label="Số điện thoại" value={editData.phone} editable={isEditing} onChange={v => setEditData(e => ({ ...e, phone: v }))} />
                <InfoField icon={<MapPin size={14} />} label="Địa chỉ" value={editData.address} editable={isEditing} onChange={v => setEditData(e => ({ ...e, address: v }))} colSpan />
              </div>
            </InfoSection>

            {/* Personal Info */}
            <InfoSection title="Thông Tin Cá Nhân" icon={<User size={16} className="text-violet-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoField icon={<Calendar size={14} />} label="Ngày sinh" value={new Date(editData.dateOfBirth).toLocaleDateString('vi-VN')} />
                <InfoField icon={<User size={14} />} label="Giới tính" value={editData.gender === 'male' ? 'Nam' : 'Nữ'} />
                <InfoField icon={<Shield size={14} />} label="CCCD/CMND" value={editData.idCard} />
                <InfoField icon={<FileText size={14} />} label="Mã số thuế" value={editData.taxCode} />
              </div>
            </InfoSection>

            {/* Work Info */}
            <InfoSection title="Thông Tin Công Việc" icon={<Briefcase size={16} className="text-amber-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoField icon={<Building2 size={14} />} label="Phòng ban" value={editData.department} />
                <InfoField icon={<Users size={14} />} label="Team" value={editData.team} />
                <InfoField icon={<Calendar size={14} />} label="Ngày vào làm" value={new Date(editData.joinDate).toLocaleDateString('vi-VN')} />
                <InfoField icon={<FileText size={14} />} label="Loại hợp đồng" value={editData.contractType} />
                <InfoField icon={<Calendar size={14} />} label="HĐ hết hạn" value={new Date(editData.contractExpiry).toLocaleDateString('vi-VN')} />
                <InfoField icon={<Phone size={14} />} label="Liên hệ khẩn cấp" value={editData.emergencyContact} />
              </div>
            </InfoSection>

            {/* Bank Info */}
            <InfoSection title="Thông Tin Ngân Hàng" icon={<Shield size={16} className="text-emerald-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoField label="Số tài khoản" value={editData.bankAccount} sensitive />
                <InfoField label="Ngân hàng" value={editData.bankName} />
              </div>
            </InfoSection>
          </div>

          {/* RIGHT — Timeline & Quick Info (1 col) */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/60 dark:bg-sg-card backdrop-blur-2xl rounded-[20px] border border-slate-200/60 dark:border-sg-border p-5 shadow-sg-sm sg-stagger" style={{ animationDelay: '200ms' }}>
              <h3 className="text-[12px] font-black text-sg-muted uppercase tracking-widest mb-4">THỐNG KÊ NHANH</h3>
              <div className="space-y-3">
                <QuickStatRow label="Booking tháng này" value={MY_KPI.bookings} color="text-blue-500" />
                <QuickStatRow label="Đặt cọc tháng này" value={MY_KPI.deposits} color="text-pink-500" />
                <QuickStatRow label="Khách hàng phụ trách" value={M.MOCK_CUSTOMERS.length} color="text-violet-500" />
                <QuickStatRow label="Ngày công tháng này" value={22} color="text-emerald-500" />
              </div>
            </div>

            {/* Recent Activity Timeline */}
            <div className="bg-white/60 dark:bg-sg-card backdrop-blur-2xl rounded-[20px] border border-slate-200/60 dark:border-sg-border p-5 shadow-sg-sm sg-stagger" style={{ animationDelay: '260ms' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-[12px] font-black text-sg-muted uppercase tracking-widest">HOẠT ĐỘNG GẦN ĐÂY</h3>
              </div>
              <div className="space-y-0.5">
                {RECENT_ACTIVITIES.map((act, idx) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="flex gap-3 py-3 group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/5 rounded-xl px-2 -mx-2 transition-colors">
                      <div className="relative shrink-0">
                        <div className={`w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center ${act.color}`}>
                          <Icon size={16} />
                        </div>
                        {idx < RECENT_ACTIVITIES.length - 1 && (
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-[calc(100%)] bg-slate-200 dark:bg-sg-border/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-sg-heading truncate">{act.title}</p>
                        <p className="text-[11px] font-medium text-sg-muted truncate mt-0.5">{act.desc}</p>
                        <p className="text-[10px] font-bold text-sg-muted/50 mt-1">{act.time}</p>
                      </div>
                      <ChevronRight size={14} className="text-sg-muted/30 group-hover:text-sg-muted transition-colors shrink-0 mt-1" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══ SUB-COMPONENTS ═══

function KPICard({ icon, label, value, sub, color, percent }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string; percent: number;
}) {
  const colorMap: Record<string, { text: string; bg: string; bar: string; glow: string }> = {
    emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', glow: 'from-emerald-500/10 to-transparent' },
    indigo: { text: 'text-indigo-500', bg: 'bg-indigo-500/10', bar: 'bg-indigo-500', glow: 'from-indigo-500/10 to-transparent' },
    amber: { text: 'text-amber-500', bg: 'bg-amber-500/10', bar: 'bg-amber-500', glow: 'from-amber-500/10 to-transparent' },
    rose: { text: 'text-rose-500', bg: 'bg-rose-500/10', bar: 'bg-rose-500', glow: 'from-rose-500/10 to-transparent' },
  };
  const c = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white/60 dark:bg-sg-card backdrop-blur-2xl rounded-[20px] border border-slate-200/60 dark:border-sg-border p-5 shadow-sg-sm relative overflow-hidden">
      <div className={`absolute inset-0 bg-linear-to-br ${c.glow} pointer-events-none`} />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.text}`}>{icon}</div>
          <p className="text-[11px] font-black text-sg-muted uppercase tracking-wider">{label}</p>
        </div>
        <p className={`text-[22px] font-black ${c.text} leading-none`}>{value}</p>
        <p className="text-[11px] font-bold text-sg-muted mt-1">{sub}</p>
        <div className="mt-3 h-1.5 rounded-full bg-sg-border/20 overflow-hidden">
          <div className={`h-full rounded-full ${c.bar} transition-all duration-1000`} style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

function InfoSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white/60 dark:bg-sg-card backdrop-blur-2xl rounded-[20px] border border-slate-200/60 dark:border-sg-border p-6 shadow-sg-sm sg-stagger" style={{ animationDelay: '120ms' }}>
      <div className="flex items-center gap-2.5 mb-6">
        {icon}
        <h3 className="text-[14px] font-black text-sg-heading tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InfoField({ icon, label, value, editable, onChange, colSpan, sensitive }: {
  icon?: React.ReactNode; label: string; value: string; editable?: boolean; onChange?: (v: string) => void; colSpan?: boolean; sensitive?: boolean;
}) {
  const [showSensitive, setShowSensitive] = useState(false);
  const displayValue = sensitive && !showSensitive ? value.replace(/./g, '•').substring(0, 12) + '...' : value;
  
  return (
    <div className={colSpan ? 'md:col-span-2' : ''}>
      <label className="text-[10px] font-black text-sg-muted uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
        {icon && <span className="text-sg-muted/50">{icon}</span>}
        {label}
        {sensitive && (
          <button onClick={() => setShowSensitive(!showSensitive)} className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 ml-1">
            {showSensitive ? 'Ẩn' : 'Hiện'}
          </button>
        )}
      </label>
      {editable && onChange ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-black/20 border border-emerald-500/30 text-[13px] font-bold text-sg-heading focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      ) : (
        <p className="text-[13px] font-bold text-sg-heading px-0.5">{displayValue}</p>
      )}
    </div>
  );
}

function QuickStatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-1 border-b border-sg-border/20 last:border-0">
      <span className="text-[12px] font-bold text-sg-muted">{label}</span>
      <span className={`text-[16px] font-black ${color}`}>{value}</span>
    </div>
  );
}

// Fix: need Users icon for the InfoField
const Users = ({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
