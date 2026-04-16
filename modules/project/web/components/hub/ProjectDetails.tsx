import React from 'react';
import { Target, MapPin, Calendar, HardHat, ShieldCheck } from 'lucide-react';
import { REProject } from '../../types';

export interface ProjectDetailsProps {
  project: REProject;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  return (
    <div className="bg-white/60 dark:bg-black/40 backdrop-blur-3xl border border-slate-200/80 dark:border-white/5 rounded-sg-xl p-8 lg:p-10 shadow-lg relative overflow-hidden group/details">
       {/* Ambient Decor */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />
       
       <h3 className="text-[18px] font-black text-sg-heading flex items-center gap-2 mb-8 relative z-10">
         <Target size={20} className="text-cyan-500" /> Vị trí & Tổng quan
       </h3>
       
       <p className="text-[15px] text-sg-subtext font-semibold leading-[1.8] mb-10 whitespace-pre-wrap relative z-10 max-w-4xl">
         {project.description}
       </p>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
         {/* Location Card */}
         <div className="bg-slate-50/50 dark:bg-white/5 p-6 rounded-[20px] border border-slate-200/50 dark:border-white/5 group-hover/details:border-cyan-500/30 transition-colors flex flex-col gap-2 relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-5 dark:opacity-20 grayscale" />
           <span className="text-[11px] font-black text-sg-muted uppercase tracking-[2px] flex items-center gap-1.5 relative z-10"><MapPin size={14} className="text-amber-500" /> Tọa độ / Vị trí</span>
           <span className="text-[16px] font-extrabold text-sg-heading leading-tight mt-1 relative z-10 drop-shadow-sm">{project.location}</span>
         </div>
         
         {/* End Date */}
         <div className="bg-slate-50/50 dark:bg-white/5 p-6 rounded-[20px] border border-slate-200/50 dark:border-white/5 group-hover/details:border-blue-500/30 transition-colors flex flex-col gap-2 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Calendar size={64} />
           </div>
           <span className="text-[11px] font-black text-sg-muted uppercase tracking-[2px] flex items-center gap-1.5 relative z-10"><Calendar size={14} className="text-blue-500" /> Bàn giao dự kiến</span>
           <span className="text-[20px] font-black text-sg-heading leading-tight mt-1 relative z-10">{new Date(project.endDate).toLocaleDateString('vi', { month: '2-digit', year: 'numeric' })}</span>
           <span className="text-[12px] font-bold text-sg-muted relative z-10">Ký hiệu {new Date(project.endDate).getFullYear()}</span>
         </div>

         {/* Contractor Info (Mocked since it's not in REProject yet but good for UI) */}
         <div className="bg-slate-50/50 dark:bg-white/5 p-6 rounded-[20px] border border-slate-200/50 dark:border-white/5 group-hover/details:border-emerald-500/30 transition-colors flex flex-col gap-2 relative overflow-hidden">
           <span className="text-[11px] font-black text-sg-muted uppercase tracking-[2px] flex items-center gap-1.5"><HardHat size={14} className="text-emerald-500" /> Đơn vị thi công</span>
           <span className="text-[16px] font-extrabold text-sg-heading leading-tight mt-1">Coteccons Group</span>
           <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1"><ShieldCheck size={12} /> Hạng A+</span>
         </div>
       </div>
    </div>
  );
};
