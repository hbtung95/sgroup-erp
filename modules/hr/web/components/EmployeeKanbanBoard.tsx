import React, { useState, useEffect, useRef } from 'react';
import { Clock, Check, Laptop, UsersRound, Star, CheckCircle } from 'lucide-react';
import { Employee } from '../types';
import { getInitials, nameToColorClass } from '../constants';

export interface EmployeeKanbanBoardProps {
  employees: Employee[];
  canEdit: boolean;
  onEdit: (employee: Employee) => void;
}

export function EmployeeKanbanBoard({ employees, canEdit, onEdit }: EmployeeKanbanBoardProps) {
  const [stageMap, setStageMap] = useState<Record<string, string>>({});
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    setStageMap(prev => {
      const next = { ...prev };
      let changed = false;
      const s1Cut = Math.max(1, Math.floor(employees.length / 4));
      const s2Cut = Math.max(2, Math.floor(employees.length / 2));
      const s3Cut = employees.length - 1;

      employees.forEach((emp, idx) => {
        if (!next[emp.id]) {
          changed = true;
          if (idx < s1Cut) next[emp.id] = 'S1';
          else if (idx < s2Cut) next[emp.id] = 'S2';
          else if (idx < s3Cut) next[emp.id] = 'S3';
          else next[emp.id] = 'S4';
        }
      });
      return changed ? next : prev;
    });
  }, [employees]);

  const stages = [
    { id: 'S1', title: 'Ngày 1: Setup', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Laptop,
      items: employees.filter(e => stageMap[e.id] === 'S1') },
    { id: 'S2', title: 'Tuần 1: Hội nhập', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: UsersRound,
      items: employees.filter(e => stageMap[e.id] === 'S2') },
    { id: 'S3', title: 'Tháng 1-2: Đánh giá', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Star,
      items: employees.filter(e => stageMap[e.id] === 'S3') },
    { id: 'S4', title: 'Hoàn tất chờ ký HĐ', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle,
      items: employees.filter(e => stageMap[e.id] === 'S4') },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsScrolling(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScrolling || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; 
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleDrop = (stageId: string, e: React.DragEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    const empId = e.dataTransfer.getData('empId');
    if (empId && empId !== '') {
      setStageMap(prev => ({ ...prev, [empId]: stageId }));
    }
    setDraggedId(null);
  };

  return (
    <>
      <style>{`
        .kanban-scrollbar::-webkit-scrollbar {
          height: 10px;
        }
        .kanban-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.03);
          border-radius: 8px;
        }
        .kanban-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(226, 29, 56, 0.4);
          border-radius: 8px;
        }
        .kanban-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(226, 29, 56, 0.8);
        }
      `}</style>
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={() => setIsScrolling(false)}
        onMouseUp={() => setIsScrolling(false)}
        onMouseMove={handleMouseMove}
        className={`flex gap-6 overflow-x-auto pb-4 pt-2 kanban-scrollbar ${isScrolling ? 'cursor-grabbing select-none' : 'cursor-auto'}`}
      >
        {stages.map(stage => (
        <div 
           key={stage.id} 
           className="w-[340px] flex-shrink-0 bg-sg-btn-bg/30 border border-sg-border rounded-[24px] p-5 flex flex-col h-fit transition-colors"
           onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
           onDrop={(e) => handleDrop(stage.id, e)}
        >
           <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stage.bg} border ${stage.border}`}>
                <stage.icon size={18} className={stage.color} />
              </div>
              <div>
                 <h4 className="text-[15px] font-extrabold text-sg-heading leading-tight">{stage.title}</h4>
                 <span className={`text-[12px] font-bold ${stage.color}`}>{stage.items.length} nhân sự</span>
              </div>
           </div>
           <div className="flex flex-col gap-3 min-h-[150px]">
              {stage.items.length === 0 ? (
                <div className="h-full py-6 border border-dashed border-sg-border rounded-2xl flex justify-center items-center">
                   <span className="text-xs font-semibold text-sg-muted">Kéo thả vào đây</span>
                </div>
              ) : stage.items.map((emp) => {
                const clr = nameToColorClass(emp.fullName || '');
                return (
                  <div 
                    key={emp.id} 
                    draggable={canEdit}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('empId', emp.id);
                      setDraggedId(emp.id);
                    }}
                    onDragEnd={() => setDraggedId(null)}
                    onClick={() => canEdit && onEdit(emp)}
                    className={`bg-sg-card/90 backdrop-blur-sm border border-sg-border/60 hover:border-sg-red/40 rounded-[18px] p-4 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-grab active:cursor-grabbing transition-all duration-300 ring-1 ring-transparent hover:ring-sg-red/20 group relative overflow-hidden ${draggedId === emp.id ? 'opacity-50 scale-95' : 'hover:-translate-y-1'}`}
                  >
                     {/* subtle hover gradient */}
                     <div className="absolute inset-0 bg-linear-to-br from-sg-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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
    </>
  );
}
