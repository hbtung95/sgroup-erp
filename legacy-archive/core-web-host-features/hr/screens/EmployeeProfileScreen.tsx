import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  ArrowLeft, User, Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck, 
  Award, CreditCard, Building, Users, FileText, Hash, Clock, Star, TrendingUp,
  CheckCircle, Landmark, BookOpen, UserCheck, Globe, Wallet, CalendarDays,
  IdCard, PhoneCall, Layers, BadgeCheck, Banknote, Search, ChevronDown, X, Pencil, Save
} from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import { useEmployees, useUpdateEmployee, usePositions, useDepartments } from '../hooks/useHR';
import { WORK_STATUS_OPTIONS, CANDIDATE_SOURCE_OPTIONS, EMPLOYMENT_TYPE_OPTIONS } from '../constants';

const TABS = [
  { key: 'personal', label: 'Thông tin cá nhân', icon: User },
  { key: 'work', label: 'Công việc & Hợp đồng', icon: Briefcase },
  { key: 'finance', label: 'Tài chính & Bảo hiểm', icon: Wallet },
  { key: 'recruitment', label: 'Tuyển dụng & Phép', icon: UserCheck },
];

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return dateStr; }
}

function formatCurrency(amount?: number) {
  if (!amount) return '—';
  return amount.toLocaleString('vi-VN') + ' ₫';
}

function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'U';
}

function getStatusConfig(status?: string) {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': case 'ĐANG LÀM VIỆC': return { label: 'Đang làm việc', color: 'text-emerald-500', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20' };
    case 'PROBATION': case 'THỬ VIỆC': return { label: 'Thử việc', color: 'text-blue-500', bg: 'bg-blue-500/15', border: 'border-blue-500/20' };
    case 'ON_LEAVE': case 'ĐANG NGHỈ': case 'ĐANG NGHỈ PHÉP': return { label: 'Đang nghỉ', color: 'text-amber-500', bg: 'bg-amber-500/15', border: 'border-amber-500/20' };
    case 'TERMINATED': case 'ĐÃ NGHỈ': case 'ĐÃ NGHỈ VIỆC': return { label: 'Đã nghỉ việc', color: 'text-red-500', bg: 'bg-red-500/15', border: 'border-red-500/20' };
    default: return { label: status || 'N/A', color: 'text-sg-muted', bg: 'bg-sg-btn-bg', border: 'border-sg-border' };
  }
}

export function EmployeeProfileScreen({ routeParams }: { routeParams?: URLSearchParams }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('personal');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editStep, setEditStep] = useState(1);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const selectorRef = useRef<HTMLDivElement>(null);
  const updateEmployee = useUpdateEmployee();
  
  const employeeId = routeParams?.get('id');
  const { data: employeesData } = useEmployees({ search: '' });
  const employeeList = Array.isArray(employeesData?.data) ? employeesData.data : (Array.isArray(employeesData) ? employeesData : []);

  // Fetch positions for dropdown
  const { data: rawPositions } = usePositions();
  const positionsList: { id: string; name: string; level?: string }[] = Array.isArray(rawPositions) ? rawPositions : (rawPositions as any)?.data ?? [];
  const positionOptions = positionsList.map(p => ({ v: p.name, l: p.name }));

  // Build level options from positions data
  const levelOptions = useMemo(() => {
    const levels = positionsList.map(p => p.level).filter(Boolean);
    const unique = [...new Set(levels)];
    const levelMap: Record<string, string> = {
      'Director': 'Giám đốc',
      'Manager': 'Quản lý',
      'Leader': 'Trưởng nhóm',
      'Senior': 'Chuyên viên cấp cao',
      'Staff': 'Nhân viên',
      'Junior': 'Chuyên viên',
      'Fresher': 'Nhân viên mới',
      'Intern': 'Thực tập sinh'
    };
    return unique.map(l => ({ v: l!, l: levelMap[l!] || l! }));
  }, [positionsList]);

  // Fetch departments for dropdown
  const { data: rawDepartments } = useDepartments();
  const departmentsList: { id: string; name: string }[] = Array.isArray(rawDepartments) ? rawDepartments : (rawDepartments as any)?.data ?? [];
  const departmentOptions = useMemo(() => [
    { v: 'Ban Giám đốc', l: 'Ban Giám đốc' },
    { v: 'Khối Hỗ trợ', l: 'Khối Hỗ trợ' },
    ...departmentsList.map(d => ({ v: d.name, l: d.name })),
  ], [departmentsList]);

  // Build recruiter options from employee list (active employees)
  const recruiterOptions = useMemo(() => 
    employeeList.map((e: any) => ({ v: e.fullName, l: `${e.fullName} (${e.employeeCode})` })),
    [employeeList]
  );
  
  // Find selected employee or default to first
  let emp: any = null;
  if (employeeId && employeeList.length > 0) {
    emp = employeeList.find((e: any) => String(e.id) === String(employeeId));
  }
  if (!emp && employeeList.length > 0) {
    emp = employeeList[0];
  }

  // Filtered list for searchable dropdown
  const filteredList = useMemo(() => {
    if (!selectorSearch.trim()) return employeeList;
    const q = selectorSearch.toLowerCase();
    return employeeList.filter((e: any) =>
      (e.fullName || '').toLowerCase().includes(q) ||
      (e.employeeCode || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.department?.name || '').toLowerCase().includes(q)
    );
  }, [employeeList, selectorSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const statusCfg = getStatusConfig(emp?.workStatus || emp?.status);

  return (
    <div className="relative flex flex-col w-full h-full bg-sg-bg overflow-x-hidden text-sg-text custom-scrollbar">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 flex items-center px-6 py-4 border-b border-sg-border bg-sg-card/80 backdrop-blur-xl">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 rounded-xl flex shrink-0 items-center justify-center bg-sg-btn-bg hover:bg-sg-border border border-sg-border transition-colors mr-4"
        >
          <ArrowLeft size={18} className="text-sg-text" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-sg-heading tracking-[0.5px]">Hồ Sơ Nhân Sự</h1>
          <p className="text-xs font-bold text-sg-subtext uppercase tracking-[1px] mt-0.5">
            Thông tin chi tiết nhân viên
          </p>
        </div>
        
        {/* Searchable Employee Selector */}
        <div className="ml-auto w-80 relative" ref={selectorRef}>
          <button
            onClick={() => { setSelectorOpen(o => !o); setSelectorSearch(''); }}
            className="w-full h-10 px-4 rounded-xl bg-sg-btn-bg border border-sg-border text-sm font-bold text-sg-heading hover:bg-sg-border transition-colors flex items-center justify-between gap-2 shadow-sm"
          >
            <span className="truncate">{emp ? `${emp.fullName} (${emp.employeeCode})` : 'Chọn nhân sự...'}</span>
            <ChevronDown size={16} className={`text-sg-muted shrink-0 transition-transform ${selectorOpen ? 'rotate-180' : ''}`} />
          </button>

          {selectorOpen && (
            <div className="absolute top-full right-0 left-0 mt-2 bg-sg-card border border-sg-border rounded-2xl shadow-2xl shadow-black/10 z-50 overflow-hidden animate-fade-in-up">
              {/* Search Input */}
              <div className="p-3 border-b border-sg-border">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-sg-muted" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Tìm theo tên, mã NV, email..."
                    value={selectorSearch}
                    onChange={e => setSelectorSearch(e.target.value)}
                    className="w-full h-9 pl-9 pr-8 rounded-lg bg-sg-bg border border-sg-border text-sm font-semibold text-sg-heading placeholder-sg-muted focus:outline-none focus:border-sg-red/50 focus:ring-1 focus:ring-sg-red/30 transition-all"
                  />
                  {selectorSearch && (
                    <button onClick={() => setSelectorSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-sg-muted hover:text-sg-text">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
              {/* Results */}
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {filteredList.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm font-semibold text-sg-muted">
                    Không tìm thấy nhân sự
                  </div>
                ) : filteredList.map((e: any) => {
                  const isSelected = emp?.id === e.id;
                  return (
                    <button
                      key={e.id}
                      onClick={() => {
                        window.location.hash = `hr_profile?id=${e.id}`;
                        setSelectorOpen(false);
                        setSelectorSearch('');
                      }}
                      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                        isSelected ? 'bg-sg-red/8 border-l-3 border-sg-red' : 'hover:bg-sg-btn-bg'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black ${
                        isSelected ? 'bg-sg-red/15 text-sg-red' : 'bg-sg-btn-bg text-sg-muted border border-sg-border'
                      }`}>
                        {(e.fullName || '?').split(/\s+/).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-[13px] font-extrabold truncate ${isSelected ? 'text-sg-red' : 'text-sg-heading'}`}>
                          {e.fullName}
                        </div>
                        <div className="text-[11px] font-bold text-sg-muted truncate">
                          {e.employeeCode} • {e.department?.name || '—'}
                        </div>
                      </div>
                      {isSelected && <CheckCircle size={16} className="text-sg-red shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        {/* Aurora Background */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-linear-to-br from-sg-red/15 via-blue-500/8 to-purple-500/10 blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 mt-8 relative z-10 w-full flex flex-col gap-6">
          
          {/* ════════ Header Card ════════ */}
          <div className="flex flex-col md:flex-row items-center gap-6 p-7 rounded-3xl bg-sg-card border border-sg-border shadow-sg-sm relative">
            {/* Avatar */}
            <div className="w-24 h-24 shrink-0 rounded-2xl flex items-center justify-center bg-linear-to-br from-sg-red/20 to-pink-500/10 border-2 border-sg-red/20 text-sg-red">
              <span className="text-3xl font-black">{emp ? getInitials(emp.fullName) : '?'}</span>
            </div>
            {/* Info */}
            <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left gap-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h2 className="text-2xl font-black text-sg-heading tracking-tight">
                  {emp?.fullName || '—'}
                </h2>
                {emp?.englishName && (
                  <span className="text-sm font-bold text-sg-muted">({emp.englishName})</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-3 py-1 rounded-lg text-xs font-black bg-sg-red/10 text-sg-red border border-sg-red/20">
                  {emp?.position?.name || '—'}
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-bold bg-sg-btn-bg text-sg-subtext border border-sg-border">
                  {emp?.employeeCode || '—'}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusCfg.bg} ${statusCfg.color} border ${statusCfg.border}`}>
                  {statusCfg.label}
                </span>
              </div>
              {/* Quick info chips */}
              <div className="flex flex-wrap gap-4 mt-1 text-xs font-bold text-sg-muted">
                <span className="flex items-center gap-1.5"><Building size={13}/> {emp?.department?.name || '—'}</span>
                <span className="flex items-center gap-1.5"><Layers size={13}/> {emp?.division || '—'}</span>
                <span className="flex items-center gap-1.5"><Users size={13}/> QL: {emp?.directManager || '—'}</span>
              </div>
            </div>
            {/* Edit Button */}
            {emp && (
              <button
                onClick={() => {
                  setEditForm({ ...emp });
                  setEditStep(1);
                  setEditOpen(true);
                }}
                className="absolute top-5 right-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sg-red text-white font-extrabold text-xs uppercase tracking-wide hover:bg-sg-red-light transition-all shadow-sg-brand hover:-translate-y-0.5"
              >
                <Pencil size={14} strokeWidth={2.5} />
                Cập nhật hồ sơ
              </button>
            )}
          </div>

          {/* ════════ Tabs ════════ */}
          <div className="flex bg-sg-btn-bg p-1.5 rounded-2xl border border-sg-border self-start overflow-x-auto">
            {TABS.map(t => {
              const isActive = activeTab === t.key;
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 whitespace-nowrap ${
                    isActive ? 'bg-sg-card text-sg-red shadow-sg-sm border border-sg-border' : 'text-sg-muted hover:text-sg-text hover:bg-sg-border'
                  }`}
                >
                  <Icon size={15} strokeWidth={2.5} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 1: Thông tin cá nhân */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 animate-fade-in-up">
              
              {/* Thông tin cơ bản */}
              <SectionCard title="Thông tin cơ bản" icon={User} color="text-sg-red" iconBg="bg-sg-red/20" iconBorder="border-sg-red/30">
                <InfoRow label="Tên nhân sự (Tiếng Việt)" value={emp?.fullName} icon={User} />
                <InfoRow label="Tên nhân sự (Tiếng Anh)" value={emp?.englishName} icon={Globe} />
                <InfoRow label="Ngày sinh" value={formatDate(emp?.dob)} icon={Calendar} />
                <InfoRow label="Giới tính" value={emp?.gender === 'male' ? 'Nam' : emp?.gender === 'female' ? 'Nữ' : '—'} icon={User} />
              </SectionCard>

              {/* Giấy tờ tùy thân */}
              <SectionCard title="Giấy tờ tùy thân" icon={IdCard} color="text-purple-400" iconBg="bg-purple-500/20" iconBorder="border-purple-500/30">
                <InfoRow label="CCCD / Passport" value={emp?.idNumber} icon={IdCard} />
                <InfoRow label="Ngày cấp" value={formatDate(emp?.idIssueDate)} icon={Calendar} />
                <InfoRow label="Nơi cấp" value={emp?.idIssuePlace} icon={MapPin} />
                <InfoRow label="VNID" value={emp?.vnId} icon={Hash} />
              </SectionCard>

              {/* Thông tin liên hệ */}
              <SectionCard title="Thông tin liên hệ" icon={Phone} color="text-blue-400" iconBg="bg-blue-500/20" iconBorder="border-blue-500/30">
                <InfoRow label="SĐT chính" value={emp?.phone} icon={Phone} />
                <InfoRow label="SĐT người thân" value={emp?.relativePhone} icon={PhoneCall} />
                <InfoRow label="Email" value={emp?.email} icon={Mail} />
              </SectionCard>

              {/* Địa chỉ */}
              <SectionCard title="Địa chỉ" icon={MapPin} color="text-emerald-400" iconBg="bg-emerald-500/20" iconBorder="border-emerald-500/30">
                <InfoRow label="Địa chỉ thường trú" value={emp?.permanentAddress} icon={MapPin} />
                <InfoRow label="Địa chỉ liên hệ" value={emp?.contactAddress} icon={MapPin} />
              </SectionCard>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 2: Công việc & Hợp đồng */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === 'work' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 animate-fade-in-up">

              {/* Vị trí công việc */}
              <SectionCard title="Vị trí công việc" icon={Briefcase} color="text-blue-400" iconBg="bg-blue-500/20" iconBorder="border-blue-500/30">
                <InfoRow label="Cấp bậc" value={emp?.level} icon={Award} />
                <InfoRow label="Bộ phận" value={emp?.division} icon={Building} />
                <InfoRow label="Phòng ban" value={emp?.department?.name} icon={Layers} />
                <InfoRow label="Vị trí" value={emp?.position?.name} icon={Briefcase} />
                <InfoRow label="Quản lý trực tiếp" value={emp?.directManager} icon={Users} />
              </SectionCard>

              {/* Hợp đồng & Mốc thời gian */}
              <SectionCard title="Hợp đồng & Mốc thời gian" icon={FileText} color="text-amber-400" iconBg="bg-amber-500/20" iconBorder="border-amber-500/30">
                <InfoRow label="Ngày tạo hồ sơ" value={formatDate(emp?.createdAt)} icon={Calendar} />
                <InfoRow label="Ngày ký hợp đồng" value={formatDate(emp?.contractDate)} icon={CalendarDays} />
                <InfoRow label="Ngày nhận việc" value={formatDate(emp?.startDate)} icon={CheckCircle} />
                <InfoRow label="Loại hình lao động" value={emp?.employmentType} icon={FileText} />
                <InfoRow label="Tình trạng công việc" value={emp?.workStatus} icon={BadgeCheck}
                  valueClassName={emp?.workStatus === 'Đang làm việc' ? 'text-emerald-500 font-black' : emp?.workStatus === 'Thử việc' ? 'text-blue-500 font-black' : undefined}
                />
              </SectionCard>

              {/* Hồ sơ cá nhân */}
              <SectionCard title="Hồ sơ cá nhân" icon={BookOpen} color="text-pink-400" iconBg="bg-pink-500/20" iconBorder="border-pink-500/30">
                <InfoRow label="Hồ sơ cá nhân" value={emp?.personalDocs} icon={FileText}
                  valueClassName={emp?.personalDocs === 'Đầy đủ' ? 'text-emerald-500 font-black' : 'text-amber-500 font-black'}
                />
                <InfoRow label="Mã nhân viên" value={emp?.employeeCode} icon={Hash} />
              </SectionCard>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 3: Tài chính & Bảo hiểm */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === 'finance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 animate-fade-in-up">

              {/* Lương */}
              <SectionCard title="Thông tin lương" icon={Banknote} color="text-emerald-400" iconBg="bg-emerald-500/20" iconBorder="border-emerald-500/30">
                <InfoRow label="Mức lương thử việc" value={formatCurrency(emp?.probationSalary)} icon={Wallet} />
                <InfoRow label="Mức lương chính thức" value={formatCurrency(emp?.officialSalary)} icon={Banknote}
                  valueClassName="text-emerald-500 font-black"
                />
              </SectionCard>

              {/* Ngân hàng */}
              <SectionCard title="Tài khoản ngân hàng" icon={Landmark} color="text-blue-400" iconBg="bg-blue-500/20" iconBorder="border-blue-500/30">
                <InfoRow label="Ngân hàng" value={emp?.bankName} icon={Landmark} />
                <InfoRow label="Số tài khoản" value={emp?.bankAccount} icon={CreditCard} />
              </SectionCard>

              {/* Thuế & Bảo hiểm */}
              <SectionCard title="Thuế & Bảo hiểm" icon={ShieldCheck} color="text-purple-400" iconBg="bg-purple-500/20" iconBorder="border-purple-500/30">
                <InfoRow label="MST cá nhân" value={emp?.taxCode} icon={Hash} />
                <InfoRow label="Số sổ bảo hiểm" value={emp?.insuranceBook} icon={ShieldCheck} />
              </SectionCard>
            </div>
          )}

          {/* ════════════════════════════════════════════════ */}
          {/* TAB 4: Tuyển dụng & Phép */}
          {/* ════════════════════════════════════════════════ */}
          {activeTab === 'recruitment' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 animate-fade-in-up">

              {/* Tuyển dụng */}
              <SectionCard title="Thông tin tuyển dụng" icon={UserCheck} color="text-pink-400" iconBg="bg-pink-500/20" iconBorder="border-pink-500/30">
                <InfoRow label="Người tuyển dụng" value={emp?.recruiter} icon={UserCheck} />
                <InfoRow label="Nguồn ứng viên" value={emp?.candidateSource} icon={Globe} />
              </SectionCard>

              {/* Ngày phép */}
              <SectionCard title="Ngày phép" icon={CalendarDays} color="text-amber-400" iconBg="bg-amber-500/20" iconBorder="border-amber-500/30">
                <InfoRow label="Số ngày phép" value={emp?.totalLeaveDays != null ? `${emp.totalLeaveDays} ngày` : '—'} icon={CalendarDays} />
                <InfoRow label="Số ngày phép còn lại" value={emp?.remainingLeaveDays != null ? `${emp.remainingLeaveDays} ngày` : '—'} icon={Clock}
                  valueClassName="text-blue-500 font-black"
                />
                {emp?.totalLeaveDays != null && emp?.remainingLeaveDays != null && (
                  <div className="mt-4 flex items-center gap-6">
                    <div className="relative w-20 h-20 shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="opacity-10 text-sg-border" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={`${(emp.remainingLeaveDays / emp.totalLeaveDays) * 251.2} 251.2`}
                          className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[17px] font-black text-blue-500 leading-none">{emp.remainingLeaveDays}</span>
                        <span className="text-[9px] font-bold text-sg-subtext uppercase">Còn lại</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                       <div className="flex justify-between items-center bg-sg-btn-bg px-3 py-1.5 rounded-lg border border-sg-border">
                         <span className="text-[11px] font-bold text-sg-subtext">Đã nghỉ:</span>
                         <span className="text-[13px] font-black text-sg-heading">{emp.totalLeaveDays - emp.remainingLeaveDays} d</span>
                       </div>
                       <div className="flex justify-between items-center bg-sg-btn-bg px-3 py-1.5 rounded-lg border border-sg-border">
                         <span className="text-[11px] font-bold text-sg-subtext">Tổng quỹ phép:</span>
                         <span className="text-[13px] font-black text-sg-heading">{emp.totalLeaveDays} d</span>
                       </div>
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>
          )}

        </div>
      </div>

      {/* ════════ Edit Modal — Premium Redesign ════════ */}
      {editOpen && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md" style={{ animation: 'fadeIn .2s ease-out' }}>
          <div className="absolute inset-0" onClick={() => setEditOpen(false)} />
          <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-sg-card rounded-[28px] shadow-2xl shadow-black/20 overflow-hidden border border-sg-border/60 ring-1 ring-white/5" style={{ animation: 'slideUp .3s cubic-bezier(.16,1,.3,1)' }}>

            {/* ──── Header with gradient accent ──── */}
            <div className="relative shrink-0 border-b border-sg-border/60 bg-sg-card z-10">
              {/* Gradient bar */}
              <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sg-red via-pink-500 to-rose-400" />
              <div className="px-6 pt-6 pb-4 flex items-center gap-3">
                {/* Avatar */}
                <div className="w-11 h-11 rounded-xl bg-linear-to-br from-sg-red/20 to-pink-500/10 border border-sg-red/20 flex items-center justify-center shrink-0">
                  <span className="text-base font-black text-sg-red">
                    {(editForm.fullName || '?').split(/\s+/).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-black text-sg-heading tracking-tight truncate">Cập nhật Hồ sơ</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-sg-subtext truncate">{editForm.fullName}</span>
                    <span className="px-1.5 py-0.5 rounded bg-sg-btn-bg border border-sg-border text-[10px] font-black text-sg-muted">{editForm.employeeCode}</span>
                  </div>
                </div>
                <button onClick={() => setEditOpen(false)} className="w-9 h-9 rounded-lg bg-sg-btn-bg hover:bg-red-500/10 hover:text-red-500 border border-sg-border flex items-center justify-center text-sg-muted transition-all duration-200 shrink-0">
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* ──── Body ──── */}
            <div className="flex-1 flex overflow-hidden">
               {/* Sidebar Stepper */}
               <div className="w-56 shrink-0 border-r border-sg-border/60 bg-sg-btn-bg/30 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                  {[
                    { s: 1, l: 'Cơ bản', i: User, h: 'Thông tin cơ bản & Liên Hệ' },
                    { s: 2, l: 'Địa chỉ & Giấy tờ', i: MapPin, h: 'Hồ sơ pháp lý' },
                    { s: 3, l: 'Công việc', i: Briefcase, h: 'Hợp đồng & Vị trí' },
                    { s: 4, l: 'Tài chính & Phép', i: Wallet, h: 'Lương & Ngày phép' }
                  ].map(step => (
                     <button
                        key={step.s}
                        onClick={() => setEditStep(step.s)}
                        className={`flex flex-col items-start gap-1 p-3 rounded-xl transition-all ${editStep === step.s ? 'bg-sg-card border border-sg-red/30 shadow-sm' : 'hover:bg-sg-btn-bg border border-transparent'}`}
                     >
                       <div className="flex items-center gap-2">
                         <step.i size={14} className={editStep === step.s ? 'text-sg-red' : 'text-sg-muted'} />
                         <span className={`text-[13px] font-extrabold ${editStep === step.s ? 'text-sg-red' : 'text-sg-heading'}`}>{step.l}</span>
                       </div>
                       <span className="text-[10px] font-bold text-sg-subtext">{step.h}</span>
                     </button>
                  ))}
               </div>

               {/* Form Content Area */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-sg-bg/30 relative">
                  <div className="max-w-xl mx-auto flex flex-col gap-6 w-full animate-sg-slide-up">
                    {editStep === 1 && (
                      <>
                        <EditSection title="Thông tin cơ bản" icon={User} color="sg-red">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                            <EditField label="Tên nhân sự (Tiếng Việt)" value={editForm.fullName} onChange={v => setEditForm(f => ({...f, fullName: v}))} required />
                            <EditField label="Tên nhân sự (Tiếng Anh)" value={editForm.englishName} onChange={v => setEditForm(f => ({...f, englishName: v}))} />
                            <EditField label="Ngày sinh" value={editForm.dob} onChange={v => setEditForm(f => ({...f, dob: v}))} type="date" />
                            <EditField label="Giới tính" value={editForm.gender} onChange={v => setEditForm(f => ({...f, gender: v}))} type="select" options={[{v:'male',l:'Nam'},{v:'female',l:'Nữ'}]} />
                          </div>
                        </EditSection>
                        <EditSection title="Thông tin liên hệ" icon={Phone} color="blue-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                            <EditField label="SĐT chính" value={editForm.phone} onChange={v => setEditForm(f => ({...f, phone: v}))} />
                            <EditField label="SĐT người thân" value={editForm.relativePhone} onChange={v => setEditForm(f => ({...f, relativePhone: v}))} />
                            <EditField label="Email" value={editForm.email} onChange={v => setEditForm(f => ({...f, email: v}))} type="email" />
                          </div>
                        </EditSection>
                      </>
                    )}
                    {editStep === 2 && (
                      <>
                        <EditSection title="Địa chỉ" icon={MapPin} color="emerald-500">
                          <div className="grid grid-cols-1 gap-4">
                            <EditField label="Địa chỉ thường trú" value={editForm.permanentAddress} onChange={v => setEditForm(f => ({...f, permanentAddress: v}))} />
                            <EditField label="Địa chỉ liên hệ" value={editForm.contactAddress} onChange={v => setEditForm(f => ({...f, contactAddress: v}))} />
                          </div>
                        </EditSection>
                        <EditSection title="Giấy tờ tùy thân" icon={IdCard} color="purple-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                            <EditField label="CCCD / Passport" value={editForm.idNumber} onChange={v => setEditForm(f => ({...f, idNumber: v}))} />
                            <EditField label="Ngày cấp" value={editForm.idIssueDate} onChange={v => setEditForm(f => ({...f, idIssueDate: v}))} type="date" />
                            <EditField label="Nơi cấp" value={editForm.idIssuePlace} onChange={v => setEditForm(f => ({...f, idIssuePlace: v}))} />
                            <EditField label="VNID" value={editForm.vnId} onChange={v => setEditForm(f => ({...f, vnId: v}))} />
                            <EditField label="MST cá nhân" value={editForm.taxCode} onChange={v => setEditForm(f => ({...f, taxCode: v}))} />
                            <EditField label="Số sổ bảo hiểm" value={editForm.insuranceBook} onChange={v => setEditForm(f => ({...f, insuranceBook: v}))} />
                          </div>
                        </EditSection>
                      </>
                    )}
                    {editStep === 3 && (
                      <EditSection title="Công việc & Hợp đồng" icon={Briefcase} color="amber-500">
                        <div className="grid grid-cols-1 gap-x-5 gap-y-4">
                          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                             <EditField label="Cấp bậc" value={editForm.level} onChange={v => setEditForm(f => ({...f, level: v}))} type="select" options={levelOptions} />
                             <EditField label="Vị trí" value={editForm.position?.name} onChange={v => setEditForm(f => ({...f, position: {...(f.position || {}), name: v}}))} type="select" options={positionOptions} />
                          </div>
                          <EditField label="Bộ phận" value={editForm.division} onChange={v => setEditForm(f => ({...f, division: v}))} type="select" options={departmentOptions} />
                          <EditField label="Quản lý trực tiếp" value={editForm.directManager} onChange={v => setEditForm(f => ({...f, directManager: v}))} type="select" options={recruiterOptions} />
                          <div className="grid grid-cols-2 gap-x-5 gap-y-4 pt-2 border-t border-sg-border/50 mt-2">
                             <EditField label="Loại hình lao động" value={editForm.employmentType} onChange={v => setEditForm(f => ({...f, employmentType: v}))} type="select" options={EMPLOYMENT_TYPE_OPTIONS} />
                             <EditField label="Tình trạng công việc" value={editForm.workStatus} onChange={v => setEditForm(f => ({...f, workStatus: v}))} type="select" options={WORK_STATUS_OPTIONS} />
                          </div>
                          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                             <EditField label="Ngày ký HĐ" value={editForm.contractDate} onChange={v => setEditForm(f => ({...f, contractDate: v}))} type="date" />
                             <EditField label="Ngày nhận việc" value={editForm.startDate} onChange={v => setEditForm(f => ({...f, startDate: v}))} type="date" />
                          </div>
                        </div>
                      </EditSection>
                    )}
                    {editStep === 4 && (
                      <>
                        <EditSection title="Tài chính" icon={Wallet} color="emerald-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                            <EditField label="Ngân hàng" value={editForm.bankName} onChange={v => setEditForm(f => ({...f, bankName: v}))} />
                            <EditField label="Số tài khoản" value={editForm.bankAccount} onChange={v => setEditForm(f => ({...f, bankAccount: v}))} />
                            <EditField label="Lương thử việc" value={editForm.probationSalary} onChange={v => setEditForm(f => ({...f, probationSalary: Number(v) || 0}))} type="number" />
                            <EditField label="Lương chính thức" value={editForm.officialSalary} onChange={v => setEditForm(f => ({...f, officialSalary: Number(v) || 0}))} type="number" />
                          </div>
                        </EditSection>
                        <EditSection title="Tuyển dụng & Phép" icon={UserCheck} color="pink-500">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                            <EditField label="Người tuyển dụng" value={editForm.recruiter} onChange={v => setEditForm(f => ({...f, recruiter: v}))} type="select" options={recruiterOptions} />
                            <EditField label="Nguồn ứng viên" value={editForm.candidateSource} onChange={v => setEditForm(f => ({...f, candidateSource: v}))} type="select" options={CANDIDATE_SOURCE_OPTIONS} />
                            <EditField label="Số ngày phép" value={editForm.totalLeaveDays} onChange={v => setEditForm(f => ({...f, totalLeaveDays: Number(v) || 0}))} type="number" />
                            <EditField label="Số phép còn lại" value={editForm.remainingLeaveDays} onChange={v => setEditForm(f => ({...f, remainingLeaveDays: Number(v) || 0}))} type="number" />
                          </div>
                        </EditSection>
                      </>
                    )}
                  </div>
               </div>
            </div>

            {/* ──── Footer ──── */}
            <div className="px-8 py-5 border-t border-sg-border/60 flex items-center justify-between gap-4 shrink-0 bg-sg-card/80 backdrop-blur-sm">
              <span className="text-[11px] font-bold text-sg-muted hidden sm:block">
                Nhấn Lưu để cập nhật hồ sơ nhân viên
              </span>
              <div className="flex gap-3 ml-auto">
                <button
                  onClick={() => setEditOpen(false)}
                  className="px-6 py-3 rounded-2xl font-extrabold text-sm text-sg-subtext bg-sg-btn-bg hover:bg-sg-border border border-sg-border transition-all duration-200 hover:-translate-y-0.5"
                >
                  Hủy bỏ
                </button>
                <button
                  disabled={updateEmployee.isPending}
                  onClick={async () => {
                    if (!editForm.fullName?.trim()) return alert('Vui lòng nhập tên nhân sự');
                    // Sync 'status' enum field from 'workStatus' display field
                    const workStatusToStatusMap: Record<string, string> = {
                      'Đang làm việc': 'active',
                      'Thử việc': 'probation',
                      'Đang nghỉ phép': 'on_leave',
                      'Đã nghỉ việc': 'terminated',
                    };
                    const syncedStatus = workStatusToStatusMap[editForm.workStatus] || editForm.status;
                    const payload = { ...editForm, status: syncedStatus };
                    try {
                      await updateEmployee.mutateAsync({ id: editForm.id, data: payload });
                      setEditOpen(false);
                    } catch (e: any) {
                      alert(e?.message || 'Có lỗi xảy ra');
                    }
                  }}
                  className={`px-7 py-3 rounded-2xl font-black text-sm text-white flex items-center gap-2.5 transition-all duration-200 shadow-lg
                    ${updateEmployee.isPending ? 'bg-sg-muted cursor-not-allowed' : 'bg-linear-to-r from-sg-red to-rose-600 hover:from-sg-red-light hover:to-rose-500 hover:-translate-y-0.5 hover:shadow-sg-brand active:translate-y-0'}`}
                >
                  {updateEmployee.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={16} strokeWidth={2.5} />
                  )}
                  LƯU THAY ĐỔI
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/* Reusable Sub-Components */
/* ═══════════════════════════════════════════════════════ */

function SectionCard({ title, icon: Icon, color, iconBg, iconBorder, children }: { title: string; icon: any; color: string; iconBg?: string; iconBorder?: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-3xl bg-sg-card border border-sg-border shadow-sg-sm flex flex-col gap-5">
      <div className="flex items-center gap-3 pb-4 border-b border-sg-border/60">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${color} ${iconBg || 'bg-sg-btn-bg'} ${iconBorder || 'border-sg-border'}`}>
          <Icon size={18} />
        </div>
        <h3 className={`text-[15px] font-extrabold ${color} tracking-wide uppercase`}>{title}</h3>
      </div>
      <div className="flex flex-col gap-4">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon: Icon, valueClassName }: { label: string; value?: string | number | null; icon?: any; valueClassName?: string }) {
  return (
    <div className="flex items-start gap-4">
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-sg-btn-bg border border-sg-border flex items-center justify-center shrink-0 text-sg-subtext mt-0.5">
          <Icon size={15} />
        </div>
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-wider mb-0.5">{label}</span>
        <span className={`text-[14px] font-semibold wrap-break-word ${valueClassName || 'text-sg-heading'}`}>
          {value || '—'}
        </span>
      </div>
    </div>
  );
}

function EditSection({ title, icon: Icon, color, children }: { title: string; icon?: any; color?: string; children: React.ReactNode }) {
  const colorMap: Record<string, { text: string; bg: string; border: string; accent: string }> = {
    'sg-red': { text: 'text-sg-red', bg: 'bg-sg-red/10', border: 'border-sg-red/20', accent: 'border-l-sg-red' },
    'blue-500': { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', accent: 'border-l-blue-500' },
    'purple-500': { text: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', accent: 'border-l-purple-500' },
    'emerald-500': { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', accent: 'border-l-emerald-500' },
    'amber-500': { text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', accent: 'border-l-amber-500' },
    'pink-500': { text: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20', accent: 'border-l-pink-500' },
  };
  const c = colorMap[color || 'sg-red'] || colorMap['sg-red'];

  return (
    <div className={`rounded-2xl border border-sg-border/50 bg-sg-card/50 overflow-hidden border-l-[3px] ${c.accent}`}>
      {/* Section header */}
      <div className="px-5 py-3.5 flex items-center gap-3 bg-sg-btn-bg/50">
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.bg} border ${c.border}`}>
            <Icon size={15} strokeWidth={2.5} className={c.text} />
          </div>
        )}
        <h4 className={`text-[12px] font-black uppercase tracking-[1.5px] ${c.text}`}>{title}</h4>
      </div>
      {/* Section body */}
      <div className="px-5 py-4">
        {children}
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, type = 'text', options, required }: {
  label: string; value?: any; onChange: (v: string) => void; type?: string;
  options?: { v: string; l: string }[]; required?: boolean;
}) {
  const baseInputClasses = "h-11 w-full rounded-xl px-4 text-[14px] font-bold text-sg-heading transition-all duration-200 bg-sg-bg/80 border border-sg-border/70 shadow-sm hover:border-sg-border focus:outline-none focus:border-sg-red focus:ring-2 focus:ring-sg-red/10 focus:shadow-md";

  if (type === 'select' && options) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-sg-subtext/80 uppercase tracking-widest pl-0.5 flex items-center gap-1">
          {label}
          {required && <span className="text-sg-red">*</span>}
        </label>
        <div className="relative">
          <select
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className={`${baseInputClasses} appearance-none pr-10 cursor-pointer`}
          >
            <option value="">— Chọn —</option>
            {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown size={15} strokeWidth={2.5} className="text-sg-muted" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-sg-subtext/80 uppercase tracking-widest pl-0.5 flex items-center gap-1">
        {label}
        {required && <span className="text-sg-red">*</span>}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className={baseInputClasses}
      />
    </div>
  );
}
