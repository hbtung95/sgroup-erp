import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { RE_PROJECT_STATUS, RE_PROPERTY_TYPE } from '../constants';
import { Search, Filter, MoreHorizontal, Calendar, Target, Plus, Users, Building2, MapPin, Edit2, Trash2, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { projectApi } from '../api/projectApi';
import type { REProject } from '../types';

export function ProjectListScreen() {
  const { data: projects, refetch } = useProjects();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<REProject | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Allow toggle

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleEdit = (proj: REProject) => {
    setEditTarget(proj);
    setShowForm(true);
    setMenuOpen(null);
  };

  const handleDelete = async (proj: REProject) => {
    if (!confirm(`Xác nhận xoá dự án "${proj.name}"?`)) return;
    try {
      await projectApi.delete(proj.id);
      refetch();
    } catch (err: any) {
      alert(err.message || 'Không thể xoá dự án');
    }
    setMenuOpen(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-10 overflow-hidden p-4 sm:p-8 lg:px-12">
       {/* Cinematic Ambient Glow */}
       <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      {/* Header Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10 sg-stagger" style={{ animationDelay: '0ms' }}>
        <div>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-cyan-500/10 to-blue-500/5 border border-cyan-500/20 w-fit mb-2 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
             <Building2 size={14} className="text-cyan-500" />
             <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.2em]">Danh mục Dự Án Phân Phối</span>
          </div>
          <h2 className="text-[36px] font-black text-transparent bg-clip-text bg-linear-to-r from-sg-heading to-sg-heading/70 tracking-tight drop-shadow-lg">Quản lý Dự Án</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Quick Stats overview inline */}
          <div className="hidden 2xl:flex items-center gap-6 mr-4 bg-white dark:bg-black/20 backdrop-blur-3xl px-6 py-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Total</span>
              <span className="text-[14px] font-black text-sg-heading">{projects.length}</span>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Selling</span>
              <span className="text-[14px] font-black text-emerald-500">{projects.filter(p=>p.status==='SELLING').length}</span>
            </div>
          </div>

          <div className="relative group flex-1 md:flex-none">
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500/0 via-blue-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity" />
            <div className="relative flex items-center h-12 bg-white dark:bg-black/40 backdrop-blur-2xl border border-slate-200 dark:border-white/5 hover:border-cyan-500/40 rounded-2xl px-4 transition-all w-full md:w-80 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
              <Search size={18} className="text-sg-muted group-hover:text-cyan-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Tìm tên, mã dự án..." 
                className="bg-transparent border-none outline-none ml-3 text-[14px] font-bold text-sg-heading w-full placeholder:text-sg-muted/60"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="relative flex-1 md:flex-none">
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-12 px-5 pr-12 bg-white dark:bg-black/40 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-2xl text-[14px] font-bold text-sg-heading appearance-none cursor-pointer focus:outline-none hover:border-cyan-500/40 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.05)]"
            >
              <option value="ALL">Tất cả Trạng thái</option>
              {Object.entries(RE_PROJECT_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <Filter size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-sg-muted pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center bg-white dark:bg-black/40 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-2xl p-1 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <button onClick={() => setViewMode('grid')} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === 'grid' ? 'bg-cyan-500 text-white shadow-md' : 'text-sg-muted hover:text-sg-heading'}`}>
              <LayoutGrid size={18} />
            </button>
            <button onClick={() => setViewMode('list')} className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${viewMode === 'list' ? 'bg-cyan-500 text-white shadow-md' : 'text-sg-muted hover:text-sg-heading'}`}>
              <List size={18} />
            </button>
          </div>

          <button
            onClick={() => { setEditTarget(null); setShowForm(true); }}
            className="h-12 px-6 flex items-center gap-2 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-2xl transition-all shadow-[0_8px_24px_rgba(6,182,212,0.3)] hover:shadow-[0_16px_32px_rgba(6,182,212,0.5)] hover:-translate-y-1 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl" />
            <Plus size={20} className="text-white relative z-10" />
            <span className="text-[14px] font-black text-white relative z-10 hidden sm:inline">Khởi Tạo</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="flex-1 flex items-center justify-center sg-stagger" style={{ animationDelay: '200ms' }}>
          <div className="text-center bg-white dark:bg-black/30 backdrop-blur-[32px] p-16 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-md relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none" />
            <div className="w-24 h-24 mx-auto rounded-[28px] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-cyan-500/20 animate-ping rounded-[28px] opacity-20" />
              <Building2 size={40} className="text-cyan-500 relative z-10" />
            </div>
            <h3 className="text-[24px] font-black text-sg-heading mb-3 tracking-tight">Vườn ươm dự án</h3>
            <p className="text-[15px] font-semibold text-sg-subtext mb-8 max-w-[300px] mx-auto leading-relaxed">Hãy khởi tạo dự án Master đầu tiên để bắt đầu phân phối và ráp rổ hàng.</p>
            <button
              onClick={() => { setEditTarget(null); setShowForm(true); }}
              className="h-14 px-8 flex items-center gap-3 mx-auto bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl text-white font-black text-[15px] shadow-[0_12px_24px_rgba(6,182,212,0.3)] hover:scale-105 transition-transform"
            >
              <Plus size={20} /> Tạo Dự Án Mới
            </button>
          </div>
        </div>
      )}

      {/* Grid OR List View */}
      {filtered.length > 0 && (
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8" : "flex flex-col gap-4"}>
            {filtered.map((proj, idx) => {
              const statusCfg = RE_PROJECT_STATUS[proj.status] || RE_PROJECT_STATUS.UPCOMING;
              const typeCfg = RE_PROPERTY_TYPE[proj.type] || RE_PROPERTY_TYPE.LAND;
              const soldPercent = proj.totalUnits > 0 ? Math.round((proj.soldUnits / proj.totalUnits) * 100) : 0;
              
              if (viewMode === 'list') {
                  // LIST VIEW
                  return (
                      <div key={proj.id} className="sg-stagger bg-white dark:bg-black/30 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex flex-col md:flex-row items-center gap-6 shadow-md hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500/50" style={{ animationDelay: `${(idx % 10) * 50}ms` }}>
                         <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms]" />
                         
                         {/* Icon */}
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative shrink-0 border shadow-inner ${statusCfg.bg.replace('/10', '/20')} ${statusCfg.color} group-hover:scale-110 transition-transform`}>
                             <Target size={24} strokeWidth={2.5} />
                             <div className={`absolute -inset-2 rounded-[24px] border border-${statusCfg.color.replace('text-', '')}/30 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse`} />
                         </div>

                         {/* Info */}
                         <div className="flex-1 min-w-0 pr-4">
                             <div className="flex items-center gap-3">
                                 <Link to={`/ProjectModule/board?id=${proj.id}`} className="text-[18px] font-black text-sg-heading truncate hover:text-cyan-500 transition-colors drop-shadow-sm">{proj.name}</Link>
                                 <span className="text-[12px] font-black text-sg-muted bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/5">{proj.code}</span>
                                 <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border shadow-xs ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                                    {statusCfg.label}
                                 </span>
                             </div>
                             <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                                <span className="text-[12px] font-bold text-sg-subtext flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <MapPin size={14} className="text-amber-500" /> {proj.location}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-xs ${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`}>
                                    {typeCfg.label}
                                </span>
                             </div>
                         </div>

                         {/* Progress */}
                         <div className="w-full md:w-48 bg-slate-50 dark:bg-black/50 px-4 py-3 rounded-xl border border-slate-200 dark:border-white/5 flex flex-col justify-center">
                            <div className="flex items-center justify-between text-[11px] font-bold text-sg-subtext mb-1.5">
                              <span>Hấp Thụ</span>
                              <span className="text-sg-heading font-black">{proj.soldUnits}/{proj.totalUnits} <span className="text-cyan-500">({soldPercent}%)</span></span>
                            </div>
                            <div className="h-1.5 bg-sg-bg rounded-full overflow-hidden shadow-inner">
                              <div className="h-full bg-linear-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${soldPercent}%` }} />
                            </div>
                         </div>

                         {/* Actions context menu block */}
                         <div className="md:ml-auto flex items-center gap-3 shrink-0">
                            {/* Hover actions block (visible on hover) */}
                            <div className="hidden lg:flex items-center gap-2 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 pointer-events-none group-hover:pointer-events-auto">
                                <Link to={`/ProjectModule/inventory?project=${proj.id}`} className="bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500 hover:text-white border border-cyan-500/20 px-3 py-1.5 rounded-lg text-[11px] font-black transition-colors">
                                    Giỏ Hàng
                                </Link>
                                <button onClick={() => handleEdit(proj)} className="bg-slate-100 dark:bg-white/10 text-sg-heading hover:bg-emerald-500 hover:text-white border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-lg text-[11px] font-black transition-colors">
                                    Settings
                                </button>
                            </div>
                            <button onClick={() => handleDelete(proj)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-colors" title="Delete">
                                 <Trash2 size={16} />
                            </button>
                         </div>
                      </div>
                  );
              }

              // GRID VIEW
              return (
                <div key={proj.id} className="relative group perspective-[1200px] sg-stagger" style={{ animationDelay: `${(idx % 10) * 100}ms` }}>
                  <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[32px] border border-slate-200 dark:border-white/5 p-8 flex flex-col gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] transition-all duration-700 hover:shadow-[0_24px_60px_rgba(0,0,0,0.12)] group-hover:-translate-y-3 relative overflow-hidden">
                    
                    {/* Glass Shimmers */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full ${statusCfg.bg} blur-[60px] opacity-20 group-hover:opacity-60 group-hover:scale-125 transition-all duration-1000`} />
                    <div className={`absolute -left-16 -bottom-16 w-48 h-48 rounded-full ${typeCfg.bg} blur-[60px] opacity-10 group-hover:opacity-30 transition-all duration-1000`} />
                    
                    {/* Status Banner Area */}
                    <div className="flex items-start justify-between relative z-10 w-full cursor-default">
                      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center border shadow-inner ${statusCfg.bg.replace('/10', '/20')} ${statusCfg.border} ${statusCfg.color} transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6`}>
                        <Target size={28} strokeWidth={2.5} />
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border shadow-xs ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                          {statusCfg.label}
                        </span>
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === proj.id ? null : proj.id); }}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-black/60 border border-slate-200 dark:border-white/10 text-sg-muted hover:text-sg-heading transition-colors"
                          >
                            <MoreHorizontal size={18} />
                          </button>
                          {menuOpen === proj.id && (
                            <div className="absolute right-0 top-11 w-44 bg-white/90 dark:bg-black/80 backdrop-blur-3xl border border-slate-200 dark:border-sg-border rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.2)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                              <button onClick={() => handleEdit(proj)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-black text-sg-heading hover:bg-cyan-500/10 hover:text-cyan-500 transition-colors">
                                <Edit2 size={16} /> Configuration
                              </button>
                              <button onClick={() => handleDelete(proj)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-black text-rose-500 hover:bg-rose-500/10 transition-colors border-t border-sg-border/50">
                                <Trash2 size={16} /> Danger: Drop
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex flex-col relative z-10 cursor-pointer" onClick={() => window.location.href = `/ProjectModule/board?id=${proj.id}`}>
                      <h4 className="text-[24px] font-black text-sg-heading tracking-tight hover:text-cyan-500 transition-colors line-clamp-1 drop-shadow-sm mb-1">
                        {proj.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-xs ${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`}>
                           {typeCfg.label}
                        </span>
                        <span className="text-[12px] font-black text-sg-muted bg-slate-100 dark:bg-black/40 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5">{proj.code}</span>
                      </div>
                    </div>

                    {/* Sales Progress */}
                    <div className="flex flex-col gap-4 relative z-10 mt-2 pointer-events-none">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-sg-subtext">
                        <MapPin size={16} className="text-sg-muted" />
                        <span className="line-clamp-1 opacity-80">{proj.location}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-black/40 px-4 py-4 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
                        <div className="flex items-center justify-between text-[12px] font-bold text-sg-subtext mb-3">
                          <span className="uppercase tracking-wider text-[10px]">Absorption Limit</span>
                          <span className="text-sg-heading font-black text-[13px]">{proj.soldUnits} / {proj.totalUnits} <span className="text-cyan-500">({soldPercent}%)</span></span>
                        </div>
                        <div className="h-2 bg-sg-bg rounded-full overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${soldPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 mt-auto border-t border-white/10 dark:border-white/5 flex items-center justify-between relative z-10 pointer-events-none">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[12px] font-black shadow-lg border border-white/20">
                          <Users size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider">PIC Manager</span>
                          <span className="text-[14px] font-black text-sg-heading leading-tight truncate max-w-[140px]">{proj.managerName || 'Chưa gán'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-sg-muted bg-slate-50 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/5" title="Mở bán dự kiến">
                        <Calendar size={14} />
                        <span className="text-[12px] font-black">{proj.startDate ? new Date(proj.startDate).toLocaleDateString('vi-VN') : 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Form Modal */}
      <ProjectFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null); }}
        onSuccess={refetch}
        editProject={editTarget}
      />
    </div>
  );
}
