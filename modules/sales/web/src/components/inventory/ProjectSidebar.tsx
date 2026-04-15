"use client";

import React from "react";
import { Search, Building, MapPin } from "lucide-react";
import type { SalesProject } from "../../lib/types";

type ProjectSidebarProps = {
  projects: SalesProject[];
  selectedProject: SalesProject | null;
  onSelectProject: (projectId: string, proj: SalesProject) => void;
};

export default function ProjectSidebar({ projects, selectedProject, onSelectProject }: ProjectSidebarProps) {
  return (
    <div className="w-full md:w-80 glass-panel rounded-3xl flex flex-col overflow-hidden p-5 flex-shrink-0">
       <h2 className="font-extrabold text-xl text-white mb-5 flex items-center tracking-tight">
           <Building className="w-5 h-5 mr-2.5 text-blue-400" /> Chọn Dự Án
       </h2>
       <div className="relative mb-5 group">
           <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
           <input placeholder="Tìm kiếm nhanh..." className="w-full bg-slate-900/60 border border-white/10 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500 shadow-inner" />
       </div>
       <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
           {projects.map(p => (
               <div 
                 key={p.id} 
                 onClick={() => onSelectProject(p.id, p)}
                 className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 border backdrop-blur-md ${selectedProject?.id === p.id ? 'bg-gradient-to-br from-blue-600/30 to-indigo-600/20 text-white border-blue-500/40 shadow-[0_8px_30px_rgba(59,130,246,0.15)] translate-x-1' : 'bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 border-white/[0.05] hover:border-white/10'}`}
               >
                   <p className="font-bold mb-1.5 text-slate-100">{p.name}</p>
                   <p className={`text-xs flex items-center font-medium ${selectedProject?.id === p.id ? 'text-blue-200' : 'text-slate-500'}`}>
                       <MapPin className="w-3.5 h-3.5 mr-1" /> {p.location || 'Chưa cập nhật'}
                   </p>
               </div>
           ))}
           {projects.length === 0 && (
               <div className="text-center p-6 bg-white/[0.02] rounded-2xl text-slate-500 italic text-sm border border-white/5 font-medium">Chưa có dự án nào</div>
           )}
       </div>
    </div>
  );
}
