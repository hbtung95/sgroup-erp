import React from 'react';
import { MoreHorizontal, Lock, Unlock, Banknote, Handshake, CheckSquare, Square, Loader2, ArrowUpRight } from 'lucide-react';
import { RE_INVENTORY_STATUS, RE_PROPERTY_TYPE } from '../../constants';
import type { REProduct, REProject } from '../../types';

interface UnitGridViewProps {
  filtered: REProduct[];
  viewMode: 'grid' | 'list';
  projects: REProject[];
  selectedMulti: string[];
  toggleMultiSelect: (id: string, e: React.MouseEvent) => void;
  setSelectedUnit: (unit: REProduct) => void;
  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;
  actionLoadingId: string | null;
  handleAction: (id: string, action: 'lock' | 'unlock' | 'deposit' | 'sold', payload?: any) => void;
  setLockModalOpen: (id: string) => void;
}

export function UnitGridView({
  filtered,
  viewMode,
  projects,
  selectedMulti,
  toggleMultiSelect,
  setSelectedUnit,
  menuOpen,
  setMenuOpen,
  actionLoadingId,
  handleAction,
  setLockModalOpen
}: UnitGridViewProps) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-12 mt-6 relative z-10 w-full h-full">
      <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
        {filtered.map((item, i) => {
          const statusCfg = RE_INVENTORY_STATUS[item.status] || RE_INVENTORY_STATUS.AVAILABLE;
          const proj = projects.find(p => p.id === item.projectId);
          const typeCfg = RE_PROPERTY_TYPE[proj?.type || 'APARTMENT'] || RE_PROPERTY_TYPE.APARTMENT;
          const projName = proj?.code || 'GL-Project';
          
          return (
            <div 
              key={item.id} 
              style={{ animationDelay: `${(i % 20) * 50}ms` }} 
              onClick={() => setSelectedUnit(item)} 
              className={`sg-stagger perspective-[1000px] group cursor-pointer h-full`}
            >
              <div className={`bg-white dark:bg-black/30 backdrop-blur-3xl border animate-in zoom-in-95 fade-in duration-500 fill-mode-both ${selectedMulti.includes(item.id) ? 'border-cyan-500 ring-2 ring-cyan-500/50 shadow-[0_16px_40px_rgba(6,182,212,0.2)] -translate-y-2' : 'border-slate-200 dark:border-white/5 shadow-md hover:shadow-xl hover:-translate-y-2'} rounded-3xl p-6 flex flex-col gap-4 transition-all duration-500 relative overflow-hidden h-full flex`}>
                
                {/* 3D Ambient Lighting Core */}
                <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[32px]" />
                <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full ${statusCfg.bg} blur-[36px] opacity-20 group-hover:opacity-60 group-hover:scale-125 transition-all duration-1000 pointer-events-none`} />
                <div className={`absolute -left-10 -bottom-10 w-32 h-32 rounded-full ${typeCfg.bg} blur-[40px] opacity-10 group-hover:opacity-30 group-hover:translate-x-4 transition-all duration-1000 pointer-events-none`} />
                
                {/* Checkbox */}
                <div 
                  className="absolute top-5 left-5 z-30 transition-all" 
                  onClick={(e) => { e.stopPropagation(); toggleMultiSelect(item.id, e); }}
                >
                  {selectedMulti.includes(item.id) ? (
                    <div className="w-5 h-5 rounded-[4px] bg-cyan-500 flex items-center justify-center shadow-md">
                      <CheckSquare size={16} className="text-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-[4px] bg-white/10 border border-white/20 group-hover:border-cyan-500/50 flex items-center justify-center transition-colors">
                      <Square size={16} className="text-transparent group-hover:text-cyan-500/50" />
                    </div>
                  )}
                </div>

                <div className="flex items-start justify-between relative z-10 pl-8">
                  <div className="flex flex-col">
                    <span className="text-[24px] font-black tracking-tight text-sg-heading group-hover:text-cyan-500 transition-colors drop-shadow-sm leading-none">{item.code}</span>
                    <span className="text-[10px] font-black text-sg-muted uppercase tracking-[0.2em] mt-1.5">{projName}</span>
                  </div>
                  <div className="relative">
                    <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === item.id ? null : item.id); }} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-sg-muted hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors">
                      {actionLoadingId === item.id ? <Loader2 size={16} className="animate-spin text-cyan-500" /> : <MoreHorizontal size={16} />}
                    </button>
                    {menuOpen === item.id && (
                      <div className="absolute right-0 top-10 w-44 bg-white/90 dark:bg-black/80 backdrop-blur-3xl border border-slate-200 dark:border-sg-border rounded-xl shadow-[0_16px_40px_rgba(0,0,0,0.2)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        {item.status === 'AVAILABLE' && (
                          <button onClick={(e) => { e.stopPropagation(); setLockModalOpen(item.id); setMenuOpen(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-black text-orange-500 hover:bg-orange-500/10 transition-colors">
                             <Lock size={14} /> Request Lock
                          </button>
                        )}
                        {(item.status === 'LOCKED' || item.status === 'RESERVED') && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handleAction(item.id, 'deposit'); }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-black text-blue-500 hover:bg-blue-500/10 transition-colors border-b border-sg-border/50">
                               <Banknote size={14} /> Deposit In
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleAction(item.id, 'unlock'); }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-black text-sg-heading hover:bg-sg-btn-bg transition-colors">
                               <Unlock size={14} /> Force Unlock
                            </button>
                          </>
                        )}
                        {item.status === 'DEPOSIT' && (
                          <button onClick={(e) => { e.stopPropagation(); handleAction(item.id, 'sold'); }} className="w-full flex items-center gap-3 px-4 py-3 text-[12px] font-black text-rose-500 hover:bg-rose-500/10 transition-colors">
                             <Handshake size={14} /> Mark as Sold
                          </button>
                        )}
                        {(item.status === 'SOLD' || item.status === 'COMPLETED') && (
                          <div className="px-4 py-3 text-[11px] font-bold text-sg-muted italic text-center uppercase tracking-wider">Locked State</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Data Tags */}
                <div className="mt-1 flex flex-col gap-2.5 relative z-10 w-full overflow-hidden bg-slate-50 dark:bg-black/40 rounded-[16px] p-3 border border-slate-200 dark:border-white/5">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-wider">Area</span>
                    <span className="text-[13px] font-black text-sg-heading">{parseFloat(Number(item.area).toFixed(2))} m²</span>
                  </div>
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-wider">Price</span>
                    <span className="text-[14px] font-black text-emerald-500 drop-shadow-sm flex items-center gap-1"><Banknote size={14}/> {(item.price / 1000000000).toFixed(2)}B</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-2 w-full border-t border-white/5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider shrink-0">Comms</span>
                    </div>
                    <span className="text-[12px] font-black text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20 shrink-0 shadow-sm">
                      {((item.commissionAmt || 0) / 1000000).toLocaleString('vi')}M
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 relative z-10 flex items-center justify-between">
                   <div className="flex flex-col flex-1 min-w-0 pr-2">
                     {item.status === 'SOLD' && item.salespersonId ? (
                       <span className="text-[10px] font-black text-sg-heading tracking-[0.1em] uppercase flex items-center gap-1"><ArrowUpRight size={12} className="text-emerald-500"/> ID {item.salespersonId}</span>
                     ) : item.status === 'RESERVED' ? (
                       <span className="text-[10px] font-black text-amber-500 tracking-[0.1em] uppercase drop-shadow-sm">Booked: 50M</span>
                     ) : (
                       <span className={`px-2.5 py-1 rounded-[8px] text-[9px] w-fit font-black uppercase tracking-[0.1em] border shadow-xs ${typeCfg.bg} ${typeCfg.color} ${typeCfg.border}`}>
                         {typeCfg.label}
                       </span>
                     )}
                   </div>
                   <span className={`px-2.5 py-1 rounded-[8px] text-[9px] font-bold tracking-[0.1em] uppercase border shadow-xs flex-none ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                     {statusCfg.label}
                   </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
