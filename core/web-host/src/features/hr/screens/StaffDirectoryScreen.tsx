import React, { useState, useMemo, useCallback } from 'react';
import {
  UserCog, Plus, Users, Target, Search, Filter, Mail, Hash, Phone, Building, Star, X, Pencil, UsersRound, ArrowRightLeft, History, Laptop, CheckCircle, Clock, Check, LayoutGrid, List
} from 'lucide-react';
import { useEmployees, useHRDashboard, useCreateEmployee, useUpdateEmployee, useDepartments, usePositions, useTeams, useTransferHistory } from '../hooks/useHR';
import type { HRRole } from '../HRSidebar';

const fmt = (n: number) => n.toLocaleString('vi-VN');

const FILTER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'ACTIVE', label: 'Đang làm' },
  { key: 'PROBATION', label: 'Thử việc' },
  { key: 'ON_LEAVE', label: 'Đang nghỉ' },
  { key: 'TERMINATED', label: 'Đã nghỉ' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Đang làm', color: 'text-emerald-500', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20' },
  { value: 'PROBATION', label: 'Thử việc', color: 'text-blue-500', bg: 'bg-blue-500/15', border: 'border-blue-500/20' },
  { value: 'ON_LEAVE', label: 'Đang nghỉ', color: 'text-amber-500', bg: 'bg-amber-500/15', border: 'border-amber-500/20' },
  { value: 'TERMINATED', label: 'Đã nghỉ', color: 'text-red-500', bg: 'bg-red-500/15', border: 'border-red-500/20' },
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'U';
}

function nameToColorClass(name: string) {
  const colors = [
    { text: 'text-pink-500', bg: 'bg-pink-500/15', border: 'border-pink-500/30' },
    { text: 'text-purple-500', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
    { text: 'text-blue-500', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
    { text: 'text-amber-500', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
    { text: 'text-emerald-500', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
    { text: 'text-cyan-500', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30' },
    { text: 'text-indigo-500', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30' },
    { text: 'text-rose-500', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const EMPTY_FORM = { fullName: '', englishName: '', email: '', phone: '', departmentId: '', positionId: '', teamId: '', status: 'ACTIVE' };

export function StaffDirectoryScreen({ userRole }: { userRole?: HRRole }) {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);

  const canEdit = userRole === 'admin' || userRole === 'hr_manager' || userRole === 'hr_director';

  const { data: dashboardData } = useHRDashboard();
  const { data: employeesData, isLoading, error } = useEmployees({
    search: searchText || undefined,
    status: activeFilter !== 'all' ? activeFilter : undefined,
  });
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  
  const { data: rawDepts } = useDepartments();
  const { data: rawPositions } = usePositions();
  const deptOptions = Array.isArray(rawDepts) ? rawDepts : (rawDepts as any)?.data ?? [];
  const posOptions = Array.isArray(rawPositions) ? rawPositions : (rawPositions as any)?.data ?? [];

  const { data: rawTeams } = useTeams(form.departmentId || undefined);
  const teamOptions = useMemo(() => Array.isArray(rawTeams) ? rawTeams : (rawTeams as any)?.data ?? [], [rawTeams]);

  const { data: rawTransfers } = useTransferHistory(editId || undefined);
  const transfers = useMemo(() => Array.isArray(rawTransfers) ? rawTransfers : [], [rawTransfers]);

  const handleDeptChange = useCallback((deptId: string) => {
    setForm(f => ({
      ...f,
      departmentId: f.departmentId === deptId ? '' : deptId,
      teamId: f.departmentId === deptId ? f.teamId : '',
    }));
  }, []);

  const employees = Array.isArray(employeesData?.data) ? employeesData.data : Array.isArray(employeesData) ? employeesData : [];
  const db = (dashboardData as any)?.data ?? dashboardData ?? {};

  const statCards = [
    { label: 'Tổng nhân sự', value: db?.totalEmployees ?? 0, icon: Users, color: 'text-pink-500', bg: 'bg-pink-500/15', gradient: 'from-pink-500 to-rose-600' },
    { label: 'Phòng ban', value: db?.departmentCount ?? 0, icon: Building, color: 'text-purple-500', bg: 'bg-purple-500/15', gradient: 'from-purple-500 to-indigo-600' },
    { label: 'Thử việc', value: db?.probationEmployees ?? 0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/15', gradient: 'from-amber-500 to-orange-600' },
    { label: 'Nghỉ phép', value: db?.onLeaveCount ?? 0, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/15', gradient: 'from-blue-500 to-cyan-600' },
  ];

  const showAlert = (msg: string) => window.alert(msg);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModalMode('create');
  };

  const openEdit = (staff: any) => {
    setForm({
      fullName: staff.fullName || '',
      englishName: staff.englishName || '',
      email: staff.email || '',
      phone: staff.phone || '',
      departmentId: staff.departmentId || staff.department?.id || '',
      positionId: staff.positionId || staff.position?.id || '',
      teamId: staff.teamId || '',
      status: staff.status || 'ACTIVE',
    });
    setEditId(staff.id);
    setModalMode('edit');
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim()) return showAlert('Vui lòng nhập họ tên nhân viên');
    const payload: any = {
      fullName: form.fullName,
      englishName: form.englishName || null,
      email: form.email || null,
      phone: form.phone || null,
      departmentId: form.departmentId || null,
      positionId: form.positionId || null,
      teamId: form.teamId || null,
    };
    try {
      if (modalMode === 'edit' && editId) {
        payload.status = form.status;
        await updateEmployee.mutateAsync({ id: editId, data: payload });
      } else {
        await createEmployee.mutateAsync(payload);
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      setModalMode(null);
    } catch (e: any) {
      showAlert(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra');
    }
  };

  const isSaving = createEmployee.isPending || updateEmployee.isPending;

  return (
    <div className="p-8 max-w-[1600px] mx-auto animate-sg-fade-in pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-[52px] h-[52px] rounded-2xl bg-sg-red/10 flex items-center justify-center border border-sg-red/20 shadow-sm">
            <Users size={24} className="text-sg-red" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-sg-heading tracking-tight">Danh bạ Nhân sự</h2>
            <p className="text-sm font-semibold text-sg-subtext mt-1">Quản lý hồ sơ nhân viên toàn công ty</p>
          </div>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="px-6 py-3 rounded-xl bg-sg-red text-white font-extrabold text-sm flex items-center gap-2 hover:bg-sg-red-light transition-all shadow-sg-brand transform hover:-translate-y-0.5">
            <Plus size={18} strokeWidth={3} /> THÊM HỒ SƠ
          </button>
        )}
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((sc, i) => (
          <div key={i} className="bg-sg-card border border-sg-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flexjustify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sc.bg} mix-blend-luminosity group-hover:mix-blend-normal transition-all z-10`}>
                <sc.icon size={22} className={sc.color} />
              </div>
            </div>
            <div className="relative z-10">
              <span className="text-4xl font-black text-sg-heading tracking-tight block leading-none">{fmt(sc.value)}</span>
              <span className="text-xs font-extrabold text-sg-muted uppercase tracking-wider mt-2 block">{sc.label}</span>
            </div>
            {/* Hover Gradient Overlay */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${sc.gradient} opacity-0 group-hover:opacity-10 blur-2xl rounded-full transition-opacity duration-500 pointer-events-none -mr-10 -mt-10`} />
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col xl:flex-row gap-4 mb-8">
        {/* View Toggles */}
        <div className="flex bg-sg-btn-bg p-1 rounded-[16px] border border-sg-border w-fit">
           <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-sg-card shadow-sm text-sg-heading' : 'text-sg-muted hover:text-sg-heading'}`}>
             <LayoutGrid size={18} />
           </button>
           <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-sg-card shadow-sm text-sg-heading' : 'text-sg-muted hover:text-sg-heading'}`}>
             <List size={18} />
           </button>
        </div>

        {/* Search Input */}
        <div className="flex-1 max-w-md relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Search size={18} className="text-sg-muted" />
          </div>
          <input
            type="text"
            className="w-full h-[48px] bg-sg-card border border-sg-border rounded-[14px] pl-11 pr-4 text-sm font-medium text-sg-heading placeholder:text-sg-muted focus:outline-none focus:border-sg-red/50 focus:ring-1 focus:ring-sg-red/50 shadow-sm transition-all"
            placeholder="Tìm theo tên, mã NV, email, phòng ban..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 xl:pb-0">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-extrabold whitespace-nowrap transition-all border
                ${activeFilter === tab.key ? 'bg-sg-red text-white border-sg-red shadow-sg-brand' : 'bg-sg-card text-sg-subtext border-sg-border hover:bg-sg-btn-bg hover:text-sg-heading'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR & LOADING STATES */}
      {isLoading && (
        <div className="py-24 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-sg-red/30 border-t-sg-red rounded-full animate-spin mb-4" />
          <span className="text-sm font-semibold text-sg-subtext">Đang tải dữ liệu nhân sự...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-sg-card border border-sg-border rounded-[28px] p-12 text-center shadow-sm">
          <span className="text-5xl block mb-4">⚠️</span>
          <h3 className="text-lg font-black text-sg-heading mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-sm text-sg-subtext font-medium max-w-md mx-auto">{(error as any)?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'}</p>
        </div>
      )}

      {!isLoading && !error && employees.length === 0 && (
         <div className="bg-sg-card border border-sg-border rounded-[28px] p-16 text-center shadow-sm">
          <span className="text-6xl block mb-6">👥</span>
          <h3 className="text-xl font-black text-sg-heading mb-2">Không có dữ liệu</h3>
          <p className="text-sm text-sg-subtext font-medium max-w-md mx-auto">
            {searchText ? 'Không tìm thấy kết quả phù hợp với từ khóa của bạn.' : 'Danh sách nhân sự đang trống. Quản trị viên hãy thêm nhân viên mới để bắt đầu.'}
          </p>
          {canEdit && !searchText && (
            <button onClick={openCreate} className="mt-8 px-6 py-3 rounded-xl bg-sg-btn-bg hover:bg-sg-border border border-sg-border text-sg-heading font-extrabold text-sm transition-all shadow-sm">
              Tạo hồ sơ đầu tiên
            </button>
          )}
        </div>
      )}

      {/* ONBOARDING KANBAN VIEW (When status = PROBATION) */}
      {!isLoading && !error && employees.length > 0 && activeFilter === 'PROBATION' && (
        <div className="flex gap-6 overflow-x-auto pb-8 custom-scrollbar">
          {[
            { id: 'S1', title: 'Ngày 1: Setup', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Laptop,
              items: employees.slice(0, Math.max(1, Math.floor(employees.length / 4))) },
            { id: 'S2', title: 'Tuần 1: Hội nhập', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: UsersRound,
              items: employees.slice(Math.max(1, Math.floor(employees.length / 4)), Math.max(2, Math.floor(employees.length / 2))) },
            { id: 'S3', title: 'Tháng 1-2: Đánh giá', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Star,
              items: employees.slice(Math.max(2, Math.floor(employees.length / 2)), employees.length - 1) },
            { id: 'S4', title: 'Hoàn tất chờ ký HĐ', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle,
              items: employees.slice(employees.length - 1) },
          ].map(stage => (
            <div key={stage.id} className="w-[340px] flex-shrink-0 bg-sg-btn-bg/30 border border-sg-border rounded-[24px] p-5 flex flex-col h-fit">
               <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stage.bg} border ${stage.border}`}>
                    <stage.icon size={18} className={stage.color} />
                  </div>
                  <div>
                     <h4 className="text-[15px] font-extrabold text-sg-heading leading-tight">{stage.title}</h4>
                     <span className={`text-[12px] font-bold ${stage.color}`}>{stage.items.length} nhân sự</span>
                  </div>
               </div>
               <div className="flex flex-col gap-3">
                  {stage.items.length === 0 ? (
                    <div className="py-6 border border-dashed border-sg-border rounded-2xl flex justify-center items-center">
                       <span className="text-xs font-semibold text-sg-muted">Trống</span>
                    </div>
                  ) : stage.items.map((emp: any) => {
                    const clr = nameToColorClass(emp.fullName || '');
                    return (
                      <div 
                        key={emp.id} 
                        onClick={() => canEdit && openEdit(emp)}
                        className="bg-sg-card border border-sg-border rounded-[18px] p-4 shadow-sm hover:shadow-md cursor-pointer hover:border-sg-red/30 transition-all group"
                      >
                         <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${clr.bg} border ${clr.border}`}>
                               <span className={`text-[13px] font-black ${clr.text}`}>{getInitials(emp.fullName || '')}</span>
                            </div>
                            <div className="flex-1 overflow-hidden">
                               <h5 className="text-[14px] font-extrabold text-sg-heading truncate group-hover:text-sg-red transition-colors">{emp.fullName}</h5>
                               <span className="text-[12px] font-semibold text-sg-subtext truncate block mt-0.5">{emp.position?.name || 'Thực tập sinh'} • {emp.department?.name || 'HR'}</span>
                            </div>
                         </div>
                         <div className="pt-3 border-t border-sg-border flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} className="text-sg-muted" />
                              <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-wider">Từ {new Date().toLocaleDateString('vi-VN')}</span>
                            </div>
                            <Check size={14} className={stage.color} />
                         </div>
                      </div>
                    )
                  })}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* LIST VIEW */}
      {!isLoading && !error && employees.length > 0 && viewMode === 'list' && activeFilter !== 'PROBATION' && (
        <div className="bg-sg-card border border-sg-border rounded-[24px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-sg-btn-bg border-b border-sg-border">
                   <th className="px-6 py-4 text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px] w-2/5">Họ Tên</th>
                   <th className="px-6 py-4 text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px] w-1/4">Chức vụ / Phòng ban</th>
                   <th className="px-6 py-4 text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px] w-1/5">Liên hệ</th>
                   <th className="px-6 py-4 text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px] text-center">Trạng thái</th>
                   {canEdit && <th className="px-6 py-4 text-[11px] font-extrabold text-sg-muted uppercase tracking-[1px] text-right"></th>}
                </tr>
             </thead>
             <tbody className="divide-y divide-sg-border">
                {employees.map((staff: any) => {
                  const clr = nameToColorClass(staff.fullName || '');
                  const st = STATUS_OPTIONS.find(s => s.value === staff.status) || STATUS_OPTIONS[0];
                  return (
                    <tr key={staff.id} className="hover:bg-sg-btn-bg transition-colors group">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${clr.bg} border ${clr.border}`}>
                               <span className={`text-[13px] font-black ${clr.text}`}>{getInitials(staff.fullName || '')}</span>
                             </div>
                             <div>
                                <h5 className="text-[14px] font-extrabold text-sg-heading">{staff.fullName}</h5>
                                <span className="text-[12px] font-medium text-sg-subtext">{staff.employeeCode}</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[13px] font-bold text-sg-heading block mb-1">{staff.position?.name || 'Nhân viên'}</span>
                          <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
                            <span className="text-[12px] font-medium text-sg-subtext">{staff.department?.name || '—'}</span>
                            {staff.team?.name && (
                              <div className="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wide">{staff.team.name}</span>
                              </div>
                            )}
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="text-[13px] font-medium text-sg-heading block truncate mb-1" title={staff.email}>{staff.email || '—'}</span>
                          <span className="text-[12px] font-medium text-sg-subtext block">{staff.phone || '—'}</span>
                       </td>
                       <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${st.bg} ${st.color} border ${st.border}`}>
                            {st.label}
                          </span>
                       </td>
                       {canEdit && (
                         <td className="px-6 py-4 text-right">
                            <button onClick={() => openEdit(staff)} className="p-2 rounded-lg text-sg-muted hover:text-sg-heading hover:bg-sg-card transition-colors border border-transparent hover:border-sg-border shadow-sm opacity-0 group-hover:opacity-100">
                               <Pencil size={16} />
                            </button>
                         </td>
                       )}
                    </tr>
                  )
                })}
             </tbody>
          </table>
        </div>
      )}

      {/* GRID VIEW */}
      {!isLoading && !error && employees.length > 0 && viewMode === 'grid' && activeFilter !== 'PROBATION' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {employees.map((staff: any) => {
            const clr = nameToColorClass(staff.fullName || '');
            const st = STATUS_OPTIONS.find(s => s.value === staff.status) || STATUS_OPTIONS[0];
            
            return (
              <div key={staff.id} className="bg-sg-card border border-sg-border rounded-[28px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                 {/* Top Accent Bar */}
                 <div className={`h-1.5 w-full bg-gradient-to-r ${clr.bg.replace('/15', '')} opacity-40`} />
                 
                 <div className="p-6">
                    {/* Identity Row */}
                    <div className="flex items-start gap-4 mb-5">
                       <div className={`w-[56px] h-[56px] rounded-[18px] flex flex-shrink-0 items-center justify-center ${clr.bg} border border-sg-border`}>
                          <span className={`text-[18px] font-black ${clr.text}`}>{getInitials(staff.fullName || '')}</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-[17px] font-extrabold text-sg-heading truncate mb-0.5 group-hover:text-sg-red transition-colors">{staff.fullName}</h4>
                          {staff.englishName && <span className="text-[13px] font-semibold italic text-sg-subtext truncate block mb-1">{staff.englishName}</span>}
                          <div className="flex items-center gap-1.5 text-sg-muted">
                            <Hash size={13} />
                            <span className="text-[12px] font-bold">{staff.employeeCode}</span>
                          </div>
                       </div>
                    </div>

                    {/* Meta tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                       <span className="px-3 py-1.5 rounded-xl bg-sg-btn-bg border border-sg-border text-[11px] font-black text-sg-heading uppercase tracking-wide">
                          {staff.position?.name || 'Staff'}
                       </span>
                       <span className={`px-2.5 py-1 rounded-xl border ${st.bg} ${st.border} ${st.color} text-[10px] font-black uppercase tracking-wide ml-auto`}>
                          {st.label}
                       </span>
                    </div>

                    {/* Department */}
                    <div className="flex items-center gap-3 pb-5 mb-5 border-b border-sg-border">
                       <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                          <Building size={14} className="text-indigo-500" />
                       </div>
                       <span className="text-[14px] font-extrabold text-sg-heading flex-1 truncate">{staff.department?.name || '—'}</span>
                       {staff.team?.name && (
                         <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sg-btn-bg border border-sg-border">
                            <UsersRound size={12} className="text-sg-muted" />
                            <span className="text-[11px] font-bold text-sg-subtext">{staff.team.name}</span>
                         </div>
                       )}
                    </div>

                    {/* Contact */}
                    <div className="flex gap-3">
                       <div className="flex-1 flex items-center gap-2 p-3 rounded-2xl bg-sg-btn-bg border border-sg-border" title={staff.email}>
                          <Mail size={16} className="text-blue-500 flex-shrink-0" />
                          <span className="text-[13px] font-bold text-sg-heading truncate">{staff.email || '—'}</span>
                       </div>
                       <div className="flex-1 flex items-center gap-2 p-3 rounded-2xl bg-sg-btn-bg border border-sg-border">
                          <Phone size={16} className="text-purple-500 flex-shrink-0" />
                          <span className="text-[13px] font-bold text-sg-heading truncate">{staff.phone || '—'}</span>
                       </div>
                    </div>

                    {canEdit && (
                       <button onClick={() => openEdit(staff)} className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-sg-card border border-sg-border shadow-sm flex items-center justify-center text-sg-muted hover:text-sg-red hover:border-sg-red/30 transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0">
                         <Pencil size={16} />
                       </button>
                    )}
                 </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL */}
      {modalMode !== null && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 animate-sg-fade-in bg-sg-heading/40 backdrop-blur-md">
          {/* Overlay to close */}
          <div className="absolute inset-0" onClick={() => setModalMode(null)} />
          
          <div className="relative w-full max-w-[560px] max-h-full flex flex-col bg-white dark:bg-zinc-900 rounded-[32px] border border-sg-border shadow-2xl animate-sg-slide-up">
             
             {/* Modal Header */}
             <div className="px-8 py-6 border-b border-sg-border flex items-center justify-between z-10 bg-white dark:bg-zinc-900 rounded-t-[32px]">
                <h3 className="text-[22px] font-black text-sg-heading">
                   {modalMode === 'edit' ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ nhân viên'}
                </h3>
                <button onClick={() => setModalMode(null)} className="p-2 -mr-2 text-sg-muted hover:bg-sg-btn-bg rounded-xl transition-colors">
                  <X size={24} />
                </button>
             </div>

             {/* Modal Body */}
             <div className="p-8 overflow-y-auto custom-scrollbar flex flex-col gap-5">
                
                <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-extrabold uppercase tracking-wide text-sg-subtext">Họ và tên *</label>
                   <input value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Nguyễn Văn A" className="h-12 w-full bg-sg-btn-bg border border-sg-border rounded-xl px-4 text-[14px] font-semibold text-sg-heading placeholder:text-sg-muted focus:outline-none focus:border-sg-red focus:ring-1 focus:ring-sg-red shadow-sm transition-all" />
                </div>

                <div className="flex flex-col gap-1.5">
                   <label className="text-[11px] font-extrabold uppercase tracking-wide text-sg-subtext">Tên tiếng Anh</label>
                   <input value={form.englishName} onChange={e => setForm(f => ({ ...f, englishName: e.target.value }))} placeholder="Nguyen Van A" className="h-12 w-full bg-sg-btn-bg border border-sg-border rounded-xl px-4 text-[14px] font-semibold text-sg-heading placeholder:text-sg-muted focus:outline-none focus:border-sg-red focus:ring-1 focus:ring-sg-red shadow-sm transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5 items-start">
                     <label className="text-[11px] font-extrabold uppercase tracking-wide text-sg-subtext">Email</label>
                     <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@sgroup.vn" type="email" className="h-12 w-full bg-sg-btn-bg border border-sg-border rounded-xl px-4 text-[14px] font-semibold text-sg-heading placeholder:text-sg-muted focus:outline-none focus:border-sg-red focus:ring-1 focus:ring-sg-red shadow-sm transition-all" />
                  </div>
                  <div className="flex flex-col gap-1.5 items-start">
                     <label className="text-[11px] font-extrabold uppercase tracking-wide text-sg-subtext">Số điện thoại</label>
                     <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="0901234567" type="tel" className="h-12 w-full bg-sg-btn-bg border border-sg-border rounded-xl px-4 text-[14px] font-semibold text-sg-heading placeholder:text-sg-muted focus:outline-none focus:border-sg-red focus:ring-1 focus:ring-sg-red shadow-sm transition-all" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wide text-sg-subtext">Phòng ban</label>
                  <div className="flex overflow-x-auto gap-2 pb-1 custom-scrollbar">
                     {deptOptions.map((d: any) => (
                       <button
                         key={d.id}
                         onClick={() => handleDeptChange(d.id)}
                         className={`whitespace-nowrap px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors shadow-sm
                           ${form.departmentId === d.id ? 'bg-sg-red text-white border-sg-red' : 'bg-sg-card border-sg-border text-sg-heading hover:bg-sg-btn-bg'}
                         `}
                       >
                         {d.name}
                       </button>
                     ))}
                  </div>
                </div>

                {form.departmentId && teamOptions.length > 0 && (
                  <div className="flex flex-col gap-1.5 animate-sg-fade-in">
                    <label className="text-[11px] font-extrabold uppercase tracking-wide text-sg-subtext flex items-center gap-1.5"><UsersRound size={12}/> Thuộc Team</label>
                    <div className="flex overflow-x-auto gap-2 pb-1 custom-scrollbar">
                       <button
                         onClick={() => setForm(f => ({ ...f, teamId: '' }))}
                         className={`whitespace-nowrap px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors shadow-sm
                           ${!form.teamId ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-sg-card border-sg-border text-sg-heading hover:bg-sg-btn-bg'}
                         `}
                       >
                         Không gắn
                       </button>
                       {teamOptions.map((t: any) => (
                         <button
                           key={t.id}
                           onClick={() => setForm(f => ({...f, teamId: f.teamId === t.id ? '' : t.id}))}
                           className={`whitespace-nowrap px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors shadow-sm
                             ${form.teamId === t.id ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-sg-card border-sg-border text-sg-heading hover:bg-sg-btn-bg'}
                           `}
                         >
                           {t.name}
                         </button>
                       ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-extrabold uppercase tracking-wide text-sg-subtext">Chức vụ</label>
                  <div className="flex overflow-x-auto gap-2 pb-1 custom-scrollbar">
                     {posOptions.map((p: any) => (
                       <button
                         key={p.id}
                         onClick={() => setForm(f => ({...f, positionId: f.positionId === p.id ? '' : p.id}))}
                         className={`whitespace-nowrap px-4 py-2 rounded-xl text-[13px] font-bold border transition-colors shadow-sm
                           ${form.positionId === p.id ? 'bg-purple-500 text-white border-purple-500' : 'bg-sg-card border-sg-border text-sg-heading hover:bg-sg-btn-bg'}
                         `}
                       >
                         {p.name}
                       </button>
                     ))}
                  </div>
                </div>

                {modalMode === 'edit' && (
                  <div className="flex flex-col gap-1.5 pt-4 border-t border-sg-border">
                    <label className="text-[11px] font-extrabold uppercase tracking-wide text-sg-subtext">Trạng thái làm việc</label>
                    <div className="flex flex-wrap gap-2">
                       {STATUS_OPTIONS.map(s => (
                         <button
                           key={s.value}
                           onClick={() => setForm(f => ({...f, status: s.value}))}
                           className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-all shadow-sm
                             ${form.status === s.value ? `${s.bg} ${s.border} ${s.color}` : 'bg-sg-card border-sg-border text-sg-heading hover:bg-sg-btn-bg'}
                           `}
                         >
                           {s.label}
                         </button>
                       ))}
                    </div>
                  </div>
                )}

                {modalMode === 'edit' && transfers.length > 0 && (
                   <div className="flex flex-col gap-1.5 pt-4">
                     <label className="text-[11px] font-extrabold uppercase tracking-wide text-sg-subtext flex items-center gap-1.5"><History size={12}/> Lịch sử luân chuyển ({transfers.length})</label>
                     <div className="border border-sg-border rounded-xl overflow-hidden bg-sg-btn-bg">
                        {transfers.map((t: any, idx) => (
                           <div key={t.id} className={`p-3 flex items-center gap-3 ${idx < transfers.length - 1 ? 'border-b border-sg-border' : ''}`}>
                              <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-white/5 flex items-center justify-center shadow-sm border border-sg-border/50">
                                 <ArrowRightLeft size={14} className="text-sg-muted" />
                              </div>
                              <div>
                                 {(t.transferType === 'DEPARTMENT' || t.transferType === 'BOTH') && (
                                    <span className="text-[12px] font-extrabold text-sg-heading block">{t.fromDepartment?.name || '—'} → {t.toDepartment?.name || '—'}</span>
                                 )}
                                 {(t.transferType === 'TEAM' || t.transferType === 'BOTH') && (
                                    <span className="text-[12px] font-bold text-indigo-500 block">Team: {t.fromTeam?.name || '—'} → {t.toTeam?.name || '—'}</span>
                                 )}
                                 <span className="text-[10px] font-semibold text-sg-subtext">
                                   {new Date(t.effectiveDate).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' })}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>
                   </div>
                )}

             </div>

             {/* Modal Footer */}
             <div className="p-6 border-t border-sg-border bg-sg-btn-bg rounded-b-[32px] flex gap-3 z-10 mt-auto">
                <button onClick={() => setModalMode(null)} className="flex-1 h-14 rounded-xl border border-sg-border bg-sg-card text-sg-subtext font-extrabold text-sm hover:bg-sg-btn-bg hover:text-sg-heading transition-colors shadow-sm">
                   Hủy
                </button>
                <button onClick={handleSubmit} disabled={isSaving} className={`flex-1 h-14 rounded-xl font-extrabold text-sm text-white transition-all shadow-sg-brand
                  ${isSaving ? 'bg-sg-muted cursor-not-allowed' : 'bg-sg-red hover:bg-sg-red-light transform hover:-translate-y-0.5'}
                `}>
                   {isSaving ? 'Đang lưu...' : modalMode === 'edit' ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ mới'}
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
