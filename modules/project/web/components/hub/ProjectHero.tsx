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
    <div className="relative h-[340px] sm:h-[400px] w-full overflow-hidden shrink-0 group/hero">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-sg-portal-bg z-0" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.15] dark:opacity-30 z-0 saturate-50 mix-blend-luminosity group-hover/hero:scale-105 transition-transform duration-1000" />
      
      {/* Ambient Lights */}
      <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-sg-portal-bg via-sg-portal-bg/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-linear-to-r from-sg-portal-bg/80 to-transparent z-10" />
      
      <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
        <div className="flex items-end gap-8 relative">
          {/* Main Icon Data Box */}
          <div className="relative">
             <div className={`absolute inset-0 ${statusCfg.bg} blur-xl opacity-50 rounded-sg-2xl group-hover/hero:scale-125 transition-transform duration-700`} />
             <div className={`w-32 h-32 sm:w-36 sm:h-36 rounded-[28px] bg-white/80 dark:bg-black/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center justify-center relative overflow-hidden group`}>
                <div className={`absolute inset-0 ${statusCfg.bg} opacity-10`} />
                <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Building2 size={56} className={`${statusCfg.color} drop-shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500`} strokeWidth={2} />
             </div>
          </div>
          
          <div className="flex flex-col pb-2 max-w-3xl">
             <div className="flex items-center gap-3 mb-3">
               <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[2px] border shadow-xs ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} flex items-center gap-1.5`}>
                 <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.color.replace('text-', 'bg-')} animate-pulse`} />
                 {statusCfg.label}
               </span>
               <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[2px] border shadow-xs ${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`}>
                 {typeCfg.label}
               </span>
               <span className="bg-sg-btn-bg/80 border border-sg-border backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black tracking-[2px] text-sg-heading shadow-xs uppercase">
                 CODE: {project.code}
               </span>
             </div>
             
             <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-sg-heading tracking-tighter drop-shadow-lg leading-[1.1] mb-2">
               {project.name}
             </h1>
          </div>
        </div>

        {/* Call to Actions */}
        <div className="flex gap-4 shrink-0">
           <Link to={`/ProjectModule/inventory?project=${project.id}`} className="h-14 px-6 flex items-center gap-2.5 bg-sg-btn-bg/80 hover:bg-sg-card border border-sg-border backdrop-blur-2xl rounded-sg-lg transition-all duration-300 shadow-sm font-bold text-sg-heading group relative overflow-hidden">
             <Grid size={20} className="text-cyan-500 group-hover:rotate-12 transition-transform duration-500 relative z-10" /> 
             <span className="relative z-10">Bảng Quản Lý Kho</span>
             <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
           </Link>
           <button className="h-14 px-8 flex items-center gap-2.5 bg-cyan-500 hover:bg-cyan-600 rounded-sg-lg transition-all duration-300 shadow-[0_8px_32px_rgba(6,182,212,0.3)] hover:shadow-[0_16px_48px_rgba(6,182,212,0.4)] hover:-translate-y-1 font-black text-white group overflow-hidden relative border border-cyan-400">
              <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent opacity-50" />
              <LayoutDashboard size={20} className="relative z-10 group-hover:scale-110 transition-transform duration-500" />
              <span className="relative z-10 tracking-wide">Điều Hành Phân Khu</span>
           </button>
        </div>
      </div>
    </div>
  );
};
