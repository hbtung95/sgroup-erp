import React, { useMemo } from 'react';
import { useProjects, useLegalDocs } from '../hooks/useProjects';
import { RE_LEGAL_PROCEDURE_STATUS } from '../constants';
import { RELegalProcedureStatus } from '../types';
import { FileText, Plus, Search, Calendar, FolderClock, Layers } from 'lucide-react';
import { legalDocApi } from '../api/projectApi';

export function LegalKanbanScreen() {
  const { data: legalDocs, refetch } = useLegalDocs();
  const { data: projects } = useProjects();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [draggedDocId, setDraggedDocId] = React.useState<string | null>(null);

  const columns = useMemo(() => {
    const cols: Record<RELegalProcedureStatus, typeof legalDocs> = {
      PREPARATION: [],
      SUBMITTED: [],
      ISSUE_FIXING: [],
      APPROVED: []
    };
    legalDocs.forEach(doc => {
      if (cols[doc.status]) {
        cols[doc.status].push(doc);
      }
    });
    return cols;
  }, [legalDocs]);

  const handleDragStart = (e: React.DragEvent, docId: string, projectId: string) => {
    e.dataTransfer.setData('docId', docId);
    e.dataTransfer.setData('projectId', projectId);
    setDraggedDocId(docId);
  };

  const handleDragEnd = () => {
    setDraggedDocId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // allow drop
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDraggedDocId(null);
    const docId = e.dataTransfer.getData('docId');
    const projectId = e.dataTransfer.getData('projectId');
    
    if (!docId || !projectId) return;

    try {
      setIsUpdating(true);
      await legalDocApi.updateStatus(projectId, docId, newStatus);
      refetch();
    } catch(err: any) {
      alert(err.message || "Không thể cập nhật trạng thái");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-10 overflow-hidden">
      
      {/* Cinematic Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="px-6 sm:px-10 lg:px-12 py-8 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-black/30 backdrop-blur-3xl relative z-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sg-stagger" style={{ animationDelay: '0ms' }}>
          <div>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-rose-500/20 to-purple-500/10 border border-rose-500/30 w-fit mb-3 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
               <FileText size={14} className="text-rose-500 drop-shadow-sm" />
               <span className="text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-[0.2em]">Sales Kit Pipeline</span>
            </div>
            <h2 className="text-[36px] sm:text-[40px] font-black text-transparent bg-clip-text bg-linear-to-r from-sg-heading to-sg-heading/70 tracking-tight drop-shadow-lg leading-none">Pháp Lý & Hồ Sơ</h2>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative group hidden sm:block">
              <div className="absolute inset-0 bg-linear-to-r from-rose-500/0 via-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity" />
              <div className="relative flex items-center h-14 bg-white dark:bg-black/40 backdrop-blur-2xl border border-slate-200 dark:border-white/5 hover:border-rose-500/40 rounded-2xl px-5 transition-all w-72 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
                <Search size={18} className="text-sg-muted group-hover:text-rose-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Tìm tài liệu, mã dự án..." 
                  className="bg-transparent border-none outline-none ml-3 text-[14px] font-bold text-sg-heading w-full placeholder:text-sg-muted/60"
                />
              </div>
            </div>
            
            <button className="h-14 px-6 flex items-center gap-3 bg-linear-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 rounded-2xl transition-all shadow-[0_8px_24px_rgba(244,63,94,0.3)] hover:shadow-[0_16px_32px_rgba(244,63,94,0.5)] hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl" />
              <Plus size={20} className="text-white relative z-10" />
              <span className="text-[14px] font-black text-white relative z-10">Tạo Tài Liệu Mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
        <div className="h-full px-6 sm:px-10 lg:px-12 py-8 min-w-max flex gap-8 items-start">
          
          {(Object.entries(RE_LEGAL_PROCEDURE_STATUS) as [RELegalProcedureStatus, any][]).map(([statusString, statusCfg], colIdx) => {
            const status = statusString as RELegalProcedureStatus;
            const columnDocs = columns[status] || [];

            return (
              <div 
                key={status} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
                className={`sg-stagger w-[380px] flex flex-col h-full bg-slate-50 dark:bg-black/30 backdrop-blur-3xl rounded-[32px] border border-slate-200 dark:border-white/5 shadow-md overflow-hidden transition-all duration-500 relative group/col ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ animationDelay: `${colIdx * 100}ms` }}
              >
                {/* Drag Target Glow */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/col:opacity-100 pointer-events-none transition-opacity duration-300" />
                
                {/* Column Ambient Light */}
                <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full ${statusCfg.bg} blur-[60px] opacity-20 pointer-events-none`} />

                {/* Column Header */}
                <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5 relative z-10">
                   <div className={`absolute top-0 left-0 right-0 h-1.5 ${statusCfg.bg} opacity-80`} />
                   <div className="flex items-center gap-4">
                     <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shadow-lg ${statusCfg.bg.replace('/10', '/20')} ${statusCfg.color} border ${statusCfg.border}`}>
                       <FolderClock size={20} strokeWidth={2.5} />
                     </div>
                     <h3 className="text-[17px] font-black text-sg-heading tracking-tight drop-shadow-sm line-clamp-1">{statusCfg.label}</h3>
                   </div>
                   <div className={`px-3 py-1.5 rounded-xl text-[13px] font-black shadow-inner border bg-white dark:bg-black/40 border-slate-200 dark:border-transparent ${statusCfg.color}`}>
                     {columnDocs.length}
                   </div>
                </div>

                {/* Column Body */}
                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 custom-scrollbar relative z-10">
                  {columnDocs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 opacity-40">
                       <Layers size={32} className="mb-3 text-sg-muted" strokeWidth={1.5} />
                       <span className="text-[13px] font-black text-sg-muted uppercase tracking-widest">Trống</span>
                    </div>
                  ) : null}

                  {columnDocs.map(doc => {
                    const docProject = projects.find(p => p.id === doc.projectId);
                    const isDragged = draggedDocId === doc.id;
                    
                    return (
                      <div 
                        key={doc.id} 
                        draggable
                        onDragStart={(e) => handleDragStart(e, doc.id, doc.projectId)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white dark:bg-black/40 backdrop-blur-2xl border ${isDragged ? 'border-rose-500 opacity-50 scale-95' : 'border-slate-200 dark:border-white/5'} rounded-[24px] p-6 flex flex-col gap-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_24px_48px_rgba(0,0,0,0.12)] hover:border-${statusCfg.color.replace('text-', '')}/40 transition-all duration-300 cursor-grab active:cursor-grabbing group hover:-translate-y-2 relative overflow-hidden`}
                      >
                        {/* Hover blob */}
                        <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full ${statusCfg.bg} blur-[36px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`} />

                        <div className="flex items-start justify-between relative z-10">
                          <span className={`px-2.5 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-[0.1em] border shadow-xs ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                            {docProject?.code || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex flex-col relative z-10">
                          <h4 className="text-[16px] font-black text-sg-heading leading-tight group-hover:text-rose-500 transition-colors drop-shadow-sm mb-1">{doc.title}</h4>
                          <p className="text-[13px] font-semibold text-sg-muted mt-2 line-clamp-3 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{doc.description}</p>
                        </div>

                        <div className="pt-5 border-t border-slate-200 dark:border-white/5 flex items-center justify-between mt-auto relative z-10">
                           <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 px-3 py-1.5 rounded-xl shadow-inner">
                              <Calendar size={14} className="text-sg-muted" />
                              <span className="text-[12px] font-bold text-sg-subtext uppercase tracking-wider">{doc.submitDate ? new Date(doc.submitDate).toLocaleDateString('vi') : 'Chưa nộp'}</span>
                           </div>
                           <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 border border-white/20 shadow-lg flex items-center justify-center text-white text-[11px] font-black group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                              {doc.assigneeName ? doc.assigneeName.slice(0, 2).toUpperCase() : 'NA'}
                           </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
