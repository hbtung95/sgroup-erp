import React, { useState, useMemo, useCallback } from 'react';
import { Users, Plus, Building, Star, Target, Search, LayoutGrid, List } from 'lucide-react';
import { useEmployees, useHRDashboard, useCreateEmployee, useUpdateEmployee, useDepartments, usePositions, useTeams, useTransferHistory } from '../hooks/useHR';
import type { HRRole } from '../types';
import { Employee, Department, Position, Team, TransferRecord, HRDashboardData } from '../types';
import { FILTER_TABS, EMPTY_FORM } from '../constants';
import { useToast } from '../../../components/ui/SGToast';
import { SkeletonStatsCard, SkeletonEmployeeCard } from '../../../components/ui/SGSkeleton';

import { StaffStatsCard } from '../components/StaffStatsCard';
import { EmployeeGridView } from '../components/EmployeeGridView';
import { EmployeeListView } from '../components/EmployeeListView';
import { EmployeeKanbanBoard } from '../components/EmployeeKanbanBoard';
import { EmployeeFormModal, EmployeeFormData } from '../components/EmployeeFormModal';

export function StaffDirectoryScreen({ userRole }: { userRole?: HRRole }) {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<EmployeeFormData>(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);

  const canEdit = userRole === 'admin' || userRole === 'hr_manager' || userRole === 'hr_director';
  const toast = useToast();

  const { data: dashboardData } = useHRDashboard();
  const { data: employeesData, isLoading, error } = useEmployees({
    search: searchText || undefined,
    status: activeFilter !== 'all' ? activeFilter : undefined,
  });
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  
  const { data: rawDepts } = useDepartments();
  const { data: rawPositions } = usePositions();
  const deptOptions: Department[] = Array.isArray(rawDepts) ? rawDepts : (rawDepts as any)?.data ?? [];
  const posOptions: Position[] = Array.isArray(rawPositions) ? rawPositions : (rawPositions as any)?.data ?? [];

  const { data: rawTeams } = useTeams(form.departmentId || undefined);
  const teamOptions: Team[] = useMemo(() => Array.isArray(rawTeams) ? rawTeams : (rawTeams as any)?.data ?? [], [rawTeams]);

  const { data: rawTransfers } = useTransferHistory(editId || undefined);
  const transfers: TransferRecord[] = useMemo(() => Array.isArray(rawTransfers) ? rawTransfers : [], [rawTransfers]);

  const handleDeptChange = useCallback((deptId: string) => {
    setForm(f => ({
      ...f,
      departmentId: f.departmentId === deptId ? '' : deptId,
      teamId: f.departmentId === deptId ? f.teamId : '',
    }));
  }, []);

  const employees: Employee[] = Array.isArray(employeesData?.data) ? employeesData.data as any : Array.isArray(employeesData) ? employeesData as any : [];
  const db: Partial<HRDashboardData> = (dashboardData as any)?.data ?? dashboardData ?? {};

  const statCards = [
    { label: 'Tổng nhân sự', value: db?.totalEmployees ?? 0, icon: Users, color: 'text-pink-500', bg: 'bg-pink-500/15', gradient: 'from-pink-500 to-rose-600' },
    { label: 'Phòng ban', value: db?.departmentCount ?? 0, icon: Building, color: 'text-purple-500', bg: 'bg-purple-500/15', gradient: 'from-purple-500 to-indigo-600' },
    { label: 'Thử việc', value: db?.probationEmployees ?? 0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/15', gradient: 'from-amber-500 to-orange-600' },
    { label: 'Nghỉ phép', value: db?.onLeaveCount ?? 0, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/15', gradient: 'from-blue-500 to-cyan-600' },
  ];



  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModalMode('create');
  };

  const openEdit = (staff: Employee) => {
    setForm({
      fullName: staff.fullName || '',
      englishName: staff.englishName || '',
      email: staff.email || '',
      phone: staff.phone || '',
      departmentId: (staff.departmentId || staff.department?.id || '').toString(),
      positionId: (staff.positionId || staff.position?.id || '').toString(),
      teamId: (staff.teamId || staff.team?.id || '').toString(),
      status: staff.status || 'ACTIVE',
    });
    setEditId(staff.id);
    setModalMode('edit');
  };

  const handleSubmit = async (formPayload: any) => {
    const nameParts = (formPayload.fullName || '').trim().split(' ');
    const lastName = nameParts.length > 1 ? nameParts[0] : '';
    const firstName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : (formPayload.fullName || '').trim();

    const payload: Omit<Employee, 'id'> = {
      ...formPayload,
      firstName,
      lastName,
      code: formPayload.fullName.substring(0, 3).toUpperCase() + '-' + Math.floor(Math.random() * 1000)
    };

    try {
      if (modalMode === 'edit' && editId) {
        await updateEmployee.mutateAsync({ id: editId, data: payload });
        toast.success(`Đã cập nhật hồ sơ "${payload.fullName}" thành công`);
      } else {
        await createEmployee.mutateAsync(payload);
        toast.success(`Đã tạo hồ sơ "${payload.fullName}" thành công`);
      }
      setEditId(null);
      setModalMode(null);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra khi lưu hồ sơ nhân viên');
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
          <StaffStatsCard key={i} {...sc} />
        ))}
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col xl:flex-row gap-4 mb-8">
        {/* View Toggles */}
        <div className="flex bg-sg-btn-bg p-1 rounded-sg-lg border border-sg-border w-fit">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonEmployeeCard key={i} />
          ))}
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
        <EmployeeKanbanBoard employees={employees} canEdit={canEdit} onEdit={openEdit} />
      )}

      {/* LIST VIEW */}
      {!isLoading && !error && employees.length > 0 && viewMode === 'list' && activeFilter !== 'PROBATION' && (
        <EmployeeListView employees={employees} canEdit={canEdit} onEdit={openEdit} />
      )}

      {/* GRID VIEW */}
      {!isLoading && !error && employees.length > 0 && viewMode === 'grid' && activeFilter !== 'PROBATION' && (
        <EmployeeGridView employees={employees} canEdit={canEdit} onEdit={openEdit} />
      )}

      {/* MODAL */}
      {modalMode !== null && (
        <EmployeeFormModal
          mode={modalMode}
          initialData={form as any}
          deptOptions={deptOptions}
          posOptions={posOptions}
          teamOptions={teamOptions}
          transfers={transfers}
          isSaving={isSaving}
          onClose={() => setModalMode(null)}
          onSubmit={handleSubmit}
          onDeptChange={handleDeptChange}
        />
      )}

    </div>
  );
}
