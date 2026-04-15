import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Grid, LayoutDashboard } from 'lucide-react';
import { REProject } from '../../types';
import { RE_PROJECT_STATUS, RE_PROPERTY_TYPE } from '../../constants';

export interface ProjectHeroProps {
  project: REProject;
}

export const ProjectHero: React.FC<ProjectHeroProps> = ({ project }) => {
  const statusCfg = RE_PROJECT_STATUS[project.status] || RE_PROJECT_STATUS.UPCOMING;
  const typeCfg = RE_PROPERTY_TYPE[project.type] || RE_PROPERTY_TYPE.LAND;

  return (
    <div className="relative h-64 sm:h-72 lg:h-80 w-full overflow-hidden shrink-0">
      <div className="absolute inset-0 bg-linear-to-br from-cyan-900/40 via-blue-900/30 to-indigo-900/40 z-0 mix-blend-overlay" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 z-0 saturate-50 mix-blend-luminosity" />
      <div className="absolute inset-0 bg-linear-to-t from-sg-portal-bg via-sg-portal-bg/60 to-transparent z-10" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="flex items-end gap-6 relative">
          <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-sg-2xl bg-white/80 dark:bg-black/40 backdrop-blur-3xl border-2 border-slate-200 dark:border-white/5 flex items-center justify-center shadow-2xl ${statusCfg.bg} ${statusCfg.border} overflow-hidden group`}>
             <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <Building2 size={48} className={statusCfg.color} strokeWidth={2} />
          </div>
          
          <div className="flex flex-col pb-2">
             <div className="flex items-center gap-3 mb-2">
               <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-widest border shadow-inner ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                 {statusCfg.label}
               </span>
               <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-widest border shadow-inner ${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`}>
                 {typeCfg.label}
               </span>
             </div>
             <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tighter drop-shadow-lg leading-tight">
               {project.name}
             </h1>
             <div className="flex items-center gap-2 mt-2 font-bold text-sg-muted">
               <span className="bg-sg-btn-bg/50 px-2.5 py-1 rounded-lg border border-sg-border/50 text-cyan-400 backdrop-blur-md">Mã: {project.code}</span>
             </div>
          </div>
        </div>

        <div className="flex gap-3 shrink-0">
           <Link to={`/ProjectModule/inventory?project=${project.id}`} className="h-12 px-5 flex items-center gap-2 bg-white/80 dark:bg-black/40 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/5 backdrop-blur-xl rounded-xl transition-all shadow-sm font-bold text-sg-heading group">
             <Grid size={18} className="text-cyan-500 group-hover:scale-110 transition-transform" /> Rổ hàng
           </Link>
           <button className="h-12 px-6 flex items-center gap-2 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-xl transition-all shadow-[0_8px_24px_rgba(6,182,212,0.25)] font-black text-white group overflow-hidden relative">
              <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl" />
              <LayoutDashboard size={18} className="relative z-10" />
              <span className="relative z-10">Báo cáo Phân khu</span>
           </button>
        </div>
      </div>
    </div>
  );
};
