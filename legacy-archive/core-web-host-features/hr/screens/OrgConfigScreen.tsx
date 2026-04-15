import React, { useState } from 'react';
import { 
  Building, Briefcase, Plus, Pencil, Trash2, X, Users, Hash,
  ChevronDown, ChevronRight, UsersRound, Settings, Network, List
} from 'lucide-react';
import { 
  useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment,
  usePositions, useCreatePosition, useUpdatePosition,
  useCreateTeam, useUpdateTeam, useDeleteTeam
} from '../hooks/useHR';
import { useToast } from '../../../components/ui/SGToast';
import { SGConfirmDialog } from '../../../components/ui/SGConfirmDialog';

type ModalMode = 'create_dept' | 'edit_dept' | 'create_team' | 'edit_team' | 'create_pos' | 'edit_pos' | null;

const EMPTY_DEPT = { name: '', code: '', description: '' };
const EMPTY_TEAM = { name: '', code: '', departmentId: '', description: '' };
const EMPTY_POS = { name: '', code: '', level: '', description: '' };
const LEVEL_OPTIONS = ['Staff', 'Senior', 'Leader', 'Manager', 'Director'];

export function OrgConfigScreen() {
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list'); 
  const [editId, setEditId] = useState('');
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  
  const [deptForm, setDeptForm] = useState(EMPTY_DEPT);
  const [teamForm, setTeamForm] = useState(EMPTY_TEAM);
  const [posForm, setPosForm] = useState(EMPTY_POS);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'dept' | 'team';
    id: string;
    name: string;
  } | null>(null);

  const toast = useToast();

  const { data: rawDepts, isLoading: loadingDepts } = useDepartments();
  const { data: rawPos, isLoading: loadingPos } = usePositions();
  const departments = Array.isArray(rawDepts) ? rawDepts : (rawDepts as any)?.data ?? [];
  const positions = Array.isArray(rawPos) ? rawPos : (rawPos as any)?.data ?? [];

  const createDept = useCreateDepartment();
  const updateDept = useUpdateDepartment();
  const deleteDept = useDeleteDepartment();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const createPos = useCreatePosition();
  const updatePos = useUpdatePosition();

  const isPending = createDept.isPending || updateDept.isPending || createTeam.isPending || updateTeam.isPending || createPos.isPending || updatePos.isPending;

  const handleDeptSubmit = async () => {
    if (!deptForm.name.trim() || !deptForm.code.trim()) return toast.warning('Vui lòng nhập tên và mã phòng ban');
    try {
      if (modalMode === 'edit_dept') {
        await updateDept.mutateAsync({ id: editId, data: deptForm });
        toast.success(`Đã cập nhật phòng ban "${deptForm.name}" thành công`);
      } else {
        await createDept.mutateAsync(deptForm);
        toast.success(`Đã tạo phòng ban "${deptForm.name}" thành công`);
      }
      setDeptForm(EMPTY_DEPT); setModalMode(null);
    } catch (e: any) { toast.error(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra'); }
  };

  const handleTeamSubmit = async () => {
    if (!teamForm.name.trim() || !teamForm.code.trim()) return toast.warning('Vui lòng nhập tên và mã team');
    try {
      if (modalMode === 'edit_team') {
        await updateTeam.mutateAsync({ id: editId, data: { name: teamForm.name, code: teamForm.code, description: teamForm.description } });
        toast.success(`Đã cập nhật team "${teamForm.name}" thành công`);
      } else {
        await createTeam.mutateAsync(teamForm);
        toast.success(`Đã tạo team "${teamForm.name}" thành công`);
      }
      setTeamForm(EMPTY_TEAM); setModalMode(null);
    } catch (e: any) { toast.error(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra'); }
  };

  const handlePosSubmit = async () => {
    if (!posForm.name.trim() || !posForm.code.trim()) return toast.warning('Vui lòng nhập tên và mã chức vụ');
    try {
      if (modalMode === 'edit_pos') {
        await updatePos.mutateAsync({ id: editId, data: posForm });
        toast.success(`Đã cập nhật chức vụ "${posForm.name}" thành công`);
      } else {
        await createPos.mutateAsync(posForm);
        toast.success(`Đã tạo chức vụ "${posForm.name}" thành công`);
      }
      setPosForm(EMPTY_POS); setModalMode(null);
    } catch (e: any) { toast.error(e?.response?.data?.message || e?.message || 'Có lỗi xảy ra'); }
  };

  const executeDelete = async () => {
    if (!confirmDialog) return;
    try {
      if (confirmDialog.type === 'dept') {
        await deleteDept.mutateAsync(confirmDialog.id);
        toast.success(`Đã xóa phòng ban "${confirmDialog.name}"`);
      } else {
        await deleteTeam.mutateAsync(confirmDialog.id);
        toast.success(`Đã xóa team "${confirmDialog.name}"`);
      }
      setConfirmDialog(null);
    } catch (e: any) { 
      toast.error(e?.response?.data?.message || 'Không thể xóa'); 
      setConfirmDialog(null);
    }
  };

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create_dept': return 'Thêm phòng ban';
      case 'edit_dept': return 'Sửa phòng ban';
      case 'create_team': return 'Thêm team';
      case 'edit_team': return 'Sửa team';
      case 'create_pos': return 'Thêm chức vụ';
      case 'edit_pos': return 'Sửa chức vụ';
      default: return '';
    }
  };

  const getModalColor = () => {
    if (modalMode?.includes('dept')) return 'bg-pink-500 shadow-pink-500/30';
    if (modalMode?.includes('team')) return 'bg-blue-500 shadow-blue-500/30';
    return 'bg-purple-500 shadow-purple-500/30';
  };

  const handleSubmit = () => {
    if (modalMode?.includes('dept')) return handleDeptSubmit();
    if (modalMode?.includes('team')) return handleTeamSubmit();
    return handlePosSubmit();
  };

  const totalTeams = departments.reduce((s: number, d: any) => s + (d.teams?.length || 0), 0);

  return (
    <div className="relative flex flex-col w-full h-full bg-sg-bg overflow-x-hidden text-sg-text custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-sg-border bg-sg-card/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-linear-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30">
            <Settings size={22} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-sg-heading tracking-tight">Cấu hình Tổ chức</h1>
            <p className="text-[13px] font-bold text-sg-subtext mt-0.5">Phòng ban → Teams → Chức vụ</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setPosForm(EMPTY_POS); setModalMode('create_pos'); }} className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all font-extrabold text-xs uppercase tracking-wide">
            <Plus size={16} strokeWidth={3} /> Chức Vụ
          </button>
          <button onClick={() => { setDeptForm(EMPTY_DEPT); setModalMode('create_dept'); }} className="flex items-center gap-2 px-4 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl shadow-lg shadow-pink-500/20 transition-all font-extrabold text-xs uppercase tracking-wide">
            <Plus size={16} strokeWidth={3} /> Phòng Ban
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard label="Phòng ban" value={departments.length} icon={Building} colorClass="text-pink-500 bg-pink-500/10 border-pink-500/20" />
            <StatCard label="Teams" value={totalTeams} icon={UsersRound} colorClass="text-blue-500 bg-blue-500/10 border-blue-500/20" />
            <StatCard label="Chức vụ" value={positions.length} icon={Briefcase} colorClass="text-purple-500 bg-purple-500/10 border-purple-500/20" />
          </div>

          <div className="flex justify-end -mt-2">
            <div className="flex bg-sg-btn-bg p-1 rounded-2xl border border-sg-border shadow-sm">
              <button onClick={() => setViewMode('tree')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all ${viewMode === 'tree' ? 'bg-sg-card text-pink-500 shadow border border-sg-border' : 'text-sg-muted hover:text-sg-text'}`}>
                <Network size={14} strokeWidth={3} /> SƠ ĐỒ CÂY
              </button>
              <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold tracking-wide transition-all ${viewMode === 'list' ? 'bg-sg-card text-pink-500 shadow border border-sg-border' : 'text-sg-muted hover:text-sg-text'}`}>
                <List size={14} strokeWidth={3} /> DANH SÁCH
              </button>
            </div>
          </div>

          {/* Core Content */}
          {loadingDepts ? (
            <div className="py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-pink-500/30 border-t-pink-500 animate-spin" /></div>
          ) : viewMode === 'list' ? (
            <div className="flex flex-col gap-6">
              {departments.map((dept: any) => {
                const isExpanded = expandedDept === dept.id;
                const deptTeams = dept.teams || [];
                return (
                  <div key={dept.id} className={`flex flex-col rounded-3xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'bg-sg-card/50 border-pink-500/30 shadow-lg shadow-pink-500/5' : 'bg-sg-card border-sg-border shadow-sg-sm'}`}>
                    {/* Header Row */}
                    <div 
                      className="p-6 flex items-center justify-between cursor-pointer hover:bg-sg-btn-bg transition-colors"
                      onClick={() => setExpandedDept(isExpanded ? null : dept.id)}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isExpanded ? 'bg-linear-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/30' : 'bg-pink-500/10 text-pink-500'}`}>
                          <Building size={24} />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-xl font-black text-sg-heading">{dept.name}</h2>
                            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-sg-btn-bg text-sg-subtext uppercase">{dept.code}</span>
                          </div>
                          <div className="flex items-center gap-5">
                            <div className="flex items-center gap-1.5 text-sg-muted">
                              <Users size={14} />
                              <span className="text-xs font-bold">{dept._count?.employees ?? 0} NS</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-blue-500">
                              <UsersRound size={14} />
                              <span className="text-xs font-bold">{deptTeams.length} Teams</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action buttons (stop propagation so it doesn't expand) */}
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditId(dept.id); setDeptForm({ name: dept.name, code: dept.code, description: dept.description || '' }); setModalMode('edit_dept'); }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-sg-btn-bg hover:bg-sg-border text-sg-subtext transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setConfirmDialog({ open: true, type: 'dept', id: dept.id, name: dept.name }); }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${isExpanded ? 'rotate-180 bg-pink-500/10 text-pink-500' : 'text-sg-muted'}`}>
                          <ChevronDown size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-glass ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden border-t border-sg-border/50">
                        <div className="p-6 bg-sg-bg/50">
                          
                          {/* Teams Header */}
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                              <UsersRound size={18} className="text-blue-500" />
                              <h3 className="text-base font-extrabold text-sg-heading">Các Team Trực Thuộc</h3>
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-blue-500/15 text-blue-500">{deptTeams.length}</span>
                            </div>
                            <button 
                              onClick={() => { setTeamForm({ ...EMPTY_TEAM, departmentId: dept.id }); setModalMode('create_team'); }}
                              className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide transition-colors"
                            >
                              <Plus size={14} strokeWidth={3} /> Thêm Team
                            </button>
                          </div>

                          {deptTeams.length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-sg-border rounded-2xl flex justify-center text-sg-muted font-bold text-sm">
                              Chưa có team nào. Bấm Thêm Team.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              {deptTeams.map((t: any) => (
                                <div key={t.id} className="flex items-center justify-between p-4 bg-sg-card border border-sg-border shadow-sm rounded-2xl hover:border-blue-500/30 transition-colors">
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                      <UsersRound size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="font-extrabold text-sg-text mb-1">{t.name}</span>
                                      <div className="flex items-center gap-3 text-xs font-bold text-sg-muted">
                                        <span className="flex items-center gap-1"><Hash size={12}/>{t.code}</span>
                                        <span className="flex items-center gap-1 text-blue-500"><Users size={12}/>{t._count?.employees ?? 0}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-2 text-sg-subtext">
                                    <button onClick={() => { setEditId(t.id); setTeamForm({ name: t.name, code: t.code, departmentId: dept.id, description: t.description || '' }); setModalMode('edit_team'); }} className="w-8 h-8 rounded-lg bg-sg-bg hover:bg-sg-border flex items-center justify-center"><Pencil size={14}/></button>
                                    <button onClick={() => setConfirmDialog({ open: true, type: 'team', id: t.id, name: t.name })} className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center"><Trash2 size={14}/></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="overflow-x-auto pb-10 custom-scrollbar">
               {/* Transformed Dynamic Tree View */}
               <div className="min-w-max flex flex-col items-center gap-10 mt-6">
                 <div className="px-10 py-5 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 text-center relative z-10 font-black tracking-wide text-lg flex items-center gap-3">
                   <Building size={24} className="text-white/80" />
                   SGroup Corporation
                 </div>
                 {departments.length > 0 && (
                   <div className="flex gap-8 border-t-2 border-sg-border/60 pt-10 relative">
                     <div className="absolute top-0 left-1/2 w-0.5 h-10 bg-sg-border/60 -translate-x-1/2 -mt-10" />
                     {departments.map((d: any, idx: number) => {
                       const colors = [
                         { top: 'from-blue-500 to-indigo-600', icon: 'text-blue-500', bg: 'bg-blue-500/10 text-blue-500', border: 'border-blue-500/20', shadow: 'shadow-blue-500/10' },
                         { top: 'from-pink-500 to-rose-600', icon: 'text-pink-500', bg: 'bg-pink-500/10 text-pink-500', border: 'border-pink-500/20', shadow: 'shadow-pink-500/10' },
                         { top: 'from-purple-500 to-violet-600', icon: 'text-purple-500', bg: 'bg-purple-500/10 text-purple-500', border: 'border-purple-500/20', shadow: 'shadow-purple-500/10' },
                         { top: 'from-amber-500 to-orange-600', icon: 'text-amber-500', bg: 'bg-amber-500/10 text-amber-500', border: 'border-amber-500/20', shadow: 'shadow-amber-500/10' },
                         { top: 'from-emerald-500 to-teal-600', icon: 'text-emerald-500', bg: 'bg-emerald-500/10 text-emerald-500', border: 'border-emerald-500/20', shadow: 'shadow-emerald-500/10' },
                         { top: 'from-cyan-500 to-blue-500', icon: 'text-cyan-500', bg: 'bg-cyan-500/10 text-cyan-500', border: 'border-cyan-500/20', shadow: 'shadow-cyan-500/10' },
                         { top: 'from-rose-500 to-red-600', icon: 'text-rose-500', bg: 'bg-rose-500/10 text-rose-500', border: 'border-rose-500/20', shadow: 'shadow-rose-500/10' },
                       ];
                       const c = colors[idx % colors.length];

                       return (
                         <div key={d.id} className="flex flex-col items-center gap-6 relative group">
                           <div className="absolute top-0 left-1/2 w-0.5 h-10 bg-sg-border/60 -translate-x-1/2 -mt-10" />
                           
                           {/* Department Card */}
                           <div className={`w-52 rounded-sg-xl bg-sg-card border ${c.border} flex flex-col items-center text-center shadow-lg ${c.shadow} overflow-hidden transform transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl`}>
                             <div className={`h-1.5 w-full bg-linear-to-r ${c.top} opacity-80`} />
                             <div className="p-6 flex flex-col items-center w-full bg-linear-to-b from-white/5 to-transparent">
                               <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.bg} border ${c.border}`}>
                                  <Building size={20} className={c.icon} />
                               </div>
                               <h3 className="font-extrabold text-sg-heading text-[15px] leading-tight mb-2 h-10 flex items-center justify-center">{d.name}</h3>
                               <span className={`px-2.5 py-1 ${c.bg} text-[10px] font-black uppercase tracking-wider rounded-lg mb-4`}>{d.code}</span>
                               
                               <div className="w-full flex items-center justify-between pt-4 border-t border-sg-border/60">
                                 <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-sg-muted uppercase tracking-widest">Nhân sự</span>
                                    <span className="text-[13px] font-black text-sg-heading">{d._count?.employees ?? 0}</span>
                                 </div>
                                 <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-bold text-sg-muted uppercase tracking-widest">Teams</span>
                                    <span className="text-[13px] font-black text-sg-heading">{d.teams?.length ?? 0}</span>
                                 </div>
                               </div>
                             </div>
                           </div>

                           {/* Teams Container */}
                           {d.teams && d.teams.length > 0 && (
                             <div className="flex flex-col gap-4 border-l-2 border-sg-border/60 pl-6 mt-2 relative w-full">
                               <div className="absolute top-0 -left-px w-0.5 h-full bg-sg-border/60" />
                               {d.teams.map((t: any) => (
                                 <div key={t.id} className="w-full min-w-[160px] p-3.5 rounded-xl bg-sg-bg border border-sg-border flex flex-col items-start relative hover:border-sg-heading/30 transition-colors">
                                    <div className="absolute top-1/2 -left-6 w-6 h-0.5 bg-sg-border/60 -translate-y-1/2" />
                                    <span className="font-extrabold text-sg-text text-[13px]">{t.name}</span>
                                    <span className={`text-[10px] font-black mt-1 ${c.icon}`}>{t.code}</span>
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       )
                     })}
                   </div>
                 )}
               </div>
            </div>
          )}

          {/* Master Positions List Row */}
          {!loadingPos && (
             <div className="mt-10 pt-10 border-t border-sg-border flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-500">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-sg-heading">Danh sách Chức vụ</h2>
                    <p className="text-sm font-bold text-sg-subtext mt-1">Toàn bộ cấu trúc cấp bậc nhân sự</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {positions.map((p: any) => {
                    const lc = { Staff: 'green', Senior: 'blue', Leader: 'purple', Manager: 'amber', Director: 'red' }[p.level as string] || 'slate';
                    const colorMap: Record<string, string> = {
                      'green': 'bg-green-500/15 text-green-500',
                      'blue': 'bg-blue-500/15 text-blue-500',
                      'purple': 'bg-purple-500/15 text-purple-500',
                      'amber': 'bg-amber-500/15 text-amber-500',
                      'red': 'bg-red-500/15 text-red-500',
                      'slate': 'bg-slate-500/15 text-slate-500'
                    };
                    return (
                      <div key={p.id} className="p-5 rounded-2xl bg-sg-card border border-sg-border shadow-sm flex flex-col relative group">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-extrabold text-sg-heading flex-1 pr-2">{p.name}</h3>
                          <button onClick={() => { setEditId(p.id); setPosForm({ name: p.name, code: p.code, level: p.level || '', description: p.description || '' }); setModalMode('edit_pos'); }} className="text-sg-muted hover:text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                           {p.level && <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${colorMap[lc]}`}>{p.level}</span>}
                           <span className="flex items-center gap-1 text-[11px] font-bold text-sg-muted"><Hash size={12}/> {p.code}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
             </div>
          )}

        </div>
      </div>

      {/* Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-md bg-sg-card border border-sg-border rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col shadow-black/40">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-sg-heading tracking-tight">{getModalTitle()}</h2>
              <button onClick={() => setModalMode(null)} className="w-8 h-8 rounded-full bg-sg-btn-bg hover:bg-sg-border flex items-center justify-center text-sg-muted transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {modalMode.includes('dept') && (
                <>
                  <InputRow label="Tên phòng ban *" value={deptForm.name} onChange={(v: string) => setDeptForm(f => ({ ...f, name: v }))} placeholder="VD: Phòng Kinh doanh" />
                  <InputRow label="Mã phòng ban *" value={deptForm.code} onChange={(v: string) => setDeptForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="SALES" />
                  <InputRow label="Mô tả" value={deptForm.description} onChange={(v: string) => setDeptForm(f => ({ ...f, description: v }))} placeholder="Nhập thêm chi tiết..." isTextArea />
                </>
              )}
              {modalMode.includes('team') && (
                <>
                  <InputRow label="Tên team *" value={teamForm.name} onChange={(v: string) => setTeamForm(f => ({ ...f, name: v }))} placeholder="VD: Team Online" />
                  <InputRow label="Mã team *" value={teamForm.code} onChange={(v: string) => setTeamForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="KD-ONL" />
                  <InputRow label="Mô tả" value={teamForm.description} onChange={(v: string) => setTeamForm(f => ({ ...f, description: v }))} placeholder="Nhập thêm chi tiết..." isTextArea />
                </>
              )}
              {modalMode.includes('pos') && (
                <>
                  <InputRow label="Tên chức vụ *" value={posForm.name} onChange={(v: string) => setPosForm(f => ({ ...f, name: v }))} placeholder="VD: Trưởng khoản" />
                  <InputRow label="Mã chức vụ *" value={posForm.code} onChange={(v: string) => setPosForm(f => ({ ...f, code: v.toUpperCase() }))} placeholder="MGR" />
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black text-sg-subtext uppercase tracking-widest pl-1">Cấp bậc</label>
                    <div className="flex flex-wrap gap-2">
                      {LEVEL_OPTIONS.map(l => (
                        <button key={l} onClick={() => setPosForm(f => ({ ...f, level: f.level === l ? '' : l }))} 
                          className={`px-4 py-2 rounded-xl text-[13px] font-extrabold border transition-colors ${posForm.level === l ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/30' : 'bg-sg-bg border-sg-border text-sg-text hover:bg-sg-border'}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <InputRow label="Mô tả" value={posForm.description} onChange={(v: string) => setPosForm(f => ({ ...f, description: v }))} placeholder="Nhập thêm chi tiết..." isTextArea />
                </>
              )}
            </div>

            <div className="flex gap-4 mt-8 pt-6 border-t border-sg-border">
              <button disabled={isPending} onClick={() => setModalMode(null)} className="flex-1 py-3.5 rounded-xl font-extrabold text-sm text-sg-subtext bg-sg-btn-bg hover:bg-sg-border transition-colors">
                HỦY BỎ
              </button>
              <button disabled={isPending} onClick={handleSubmit} className={`flex-1 flex justify-center py-3.5 rounded-xl font-extrabold text-sm text-white ${getModalColor()} hover:opacity-90 transition-all uppercase tracking-wide`}>
                {isPending ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : 'XÁC NHẬN'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <SGConfirmDialog
        open={confirmDialog?.open || false}
        title={confirmDialog?.type === 'dept' ? 'Xóa phòng ban' : 'Xóa team'}
        message={confirmDialog?.type === 'dept'
          ? `Bạn có chắc chắn muốn xóa phòng ban "${confirmDialog?.name}"? Tất cả team trực thuộc cũng sẽ bị xóa vĩnh viễn.`
          : `Bạn có chắc chắn muốn xóa team "${confirmDialog?.name}"?`}
        onConfirm={executeDelete}
        onCancel={() => setConfirmDialog(null)}
        isLoading={deleteDept.isPending || deleteTeam.isPending}
      />

    </div>
  );
}

function StatCard({ label, value, icon: Icon, colorClass }: any) {
  return (
    <div className="p-6 bg-sg-card border border-sg-border rounded-3xl shadow-sg-sm flex items-center gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-black text-sg-muted uppercase tracking-widest mb-1">{label}</span>
        <span className="text-3xl font-black text-sg-heading tracking-tighter">{value}</span>
      </div>
    </div>
  )
}

function InputRow({ label, value, onChange, placeholder, isTextArea }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-black text-sg-subtext uppercase tracking-widest pl-1">{label}</label>
      {isTextArea ? (
        <textarea 
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} 
          className="w-full bg-sg-bg border border-sg-border rounded-2xl px-5 py-4 text-sm font-semibold text-sg-text placeholder-sg-muted focus:border-sg-red focus:ring-1 focus:ring-sg-red transition-all min-h-[100px] outline-none"
        />
      ) : (
        <input 
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} 
          className="w-full bg-sg-bg border border-sg-border rounded-full px-5 py-3.5 text-sm font-semibold text-sg-text placeholder-sg-muted focus:border-sg-red focus:ring-1 focus:ring-sg-red transition-all outline-none"
        />
      )}
    </div>
  )
}
