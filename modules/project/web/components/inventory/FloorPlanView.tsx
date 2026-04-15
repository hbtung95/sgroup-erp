import React from 'react';
import { Building2, CheckSquare, Square, Layers, Sparkles } from 'lucide-react';
import { RE_INVENTORY_STATUS } from '../../constants';
import type { REProduct } from '../../types';

interface FloorPlanViewProps {
  filtered: REProduct[];
  hoveredUnit: string | null;
  setHoveredUnit: (id: string | null) => void;
  selectedMulti: string[];
  toggleMultiSelect: (id: string, e: React.MouseEvent) => void;
  setSelectedUnit: (unit: REProduct) => void;
}

export function FloorPlanView({
  filtered,
  hoveredUnit,
  setHoveredUnit,
  selectedMulti,
  toggleMultiSelect,
  setSelectedUnit
}: FloorPlanViewProps) {
  
  // Group by block, then by floor
  const blockMap = new Map<string, Map<number, REProduct[]>>();
  filtered.forEach(item => {
    const block = item.block || 'N/A';
    if (!blockMap.has(block)) blockMap.set(block, new Map());
    const floorMap = blockMap.get(block)!;
    const floor = item.floor || 0;
    if (!floorMap.has(floor)) floorMap.set(floor, []);
    floorMap.get(floor)!.push(item);
  });

  const blocks = Array.from(blockMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar pb-12 mt-6 relative z-10 w-full">
      <div className="flex flex-col gap-10">
        {blocks.map(([blockName, floorMap], blockIdx) => {
          const floors = Array.from(floorMap.entries()).sort((a, b) => b[0] - a[0]); // top floor first
          
          return (
            <div key={blockName} className="relative z-10 w-full perspective-[1200px]">
              <div className="bg-white dark:bg-black/30 backdrop-blur-3xl border border-slate-200 dark:border-white/5 rounded-[32px] p-8 shadow-md relative overflow-hidden transition-all duration-700">
                {/* Ambient Lighting Background */}
                <div className="absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none" />
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
                
                {/* Block Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200 dark:border-white/5 pb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[20px] bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_8px_24px_rgba(6,182,212,0.3)] border border-white/20">
                      <Building2 size={24} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-[28px] font-black text-transparent bg-clip-text bg-linear-to-r from-sg-heading to-cyan-500 tracking-tight drop-shadow-sm flex items-center gap-2">
                        Tòa {blockName} <Sparkles size={16} className="text-amber-500" />
                      </h3>
                      <p className="text-[12px] font-bold text-sg-muted uppercase tracking-widest mt-1s flex items-center gap-2"><Layers size={14}/> {floors.length} Tầng • {floors.reduce((sum, [, u]) => sum + u.length, 0)} Sản phẩm</p>
                    </div>
                  </div>
                  {/* Types Legend */}
                  <div className="flex items-center gap-4 flex-wrap bg-slate-50 dark:bg-black/40 px-5 py-3 rounded-2xl border border-slate-200 dark:border-white/5">
                    {Object.entries(RE_INVENTORY_STATUS).slice(0, 5).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2">
                         <div className={`w-3.5 h-3.5 rounded-[4px] shadow-sm ${v.bg} border border-white/20`} />
                         <span className="text-[10px] font-black text-sg-heading uppercase tracking-wider">{v.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floor Matrix */}
                <div className="flex flex-col gap-2 relative z-10">
                  {floors.map(([floorNum, units], fIdx) => {
                    const sortedUnits = [...units].sort((a, b) => a.code.localeCompare(b.code));
                    return (
                      <div key={floorNum} className="flex flex-col sm:flex-row items-stretch gap-2 group/floor hover:bg-slate-100 dark:hover:bg-white/5 rounded-[20px] p-2 transition-colors">
                        {/* Floor Label */}
                        <div className="w-full sm:w-28 shrink-0 flex items-center sm:justify-center px-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-2xl shadow-inner">
                          <span className="text-[13px] font-black text-sg-heading tracking-wider whitespace-nowrap">
                            {floorNum === 0 ? 'TRỆT' : `TẦNG ${floorNum}`}
                          </span>
                        </div>
                        {/* Unit Cells */}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                          {sortedUnits.map((unit, uIdx) => {
                            const sCfg = RE_INVENTORY_STATUS[unit.status] || RE_INVENTORY_STATUS.AVAILABLE;
                            const isHovered = hoveredUnit === unit.id;
                            const isSelected = selectedMulti.includes(unit.id);
                            
                            return (
                              <div
                                key={unit.id}
                                style={{ animationDelay: `${(fIdx * 5 + uIdx) * 20}ms` }}
                                className={`sg-stagger relative flex flex-col rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                                  bg-white dark:bg-black/40 backdrop-blur-md
                                  ${isHovered || isSelected ? 'ring-2 ring-cyan-500 shadow-md scale-105 z-20 border-cyan-500' : 'border-slate-200 dark:border-white/5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-lg hover:scale-105 opacity-100'}
                                `}
                                onMouseEnter={() => setHoveredUnit(unit.id)}
                                onMouseLeave={() => setHoveredUnit(null)}
                                onClick={(e) => { e.stopPropagation(); setSelectedUnit(unit); }}
                              >
                                {/* Active Glow in cell */}
                                <div className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                {/* Checkbox */}
                                <div 
                                  className={`absolute -top-1 -right-1 z-30 transition-all ${isSelected || isHovered ? 'opacity-100' : 'opacity-0'}`} 
                                  onClick={(e) => { e.stopPropagation(); toggleMultiSelect(unit.id, e); }}
                                >
                                  {isSelected ? (
                                    <div className="w-5 h-5 rounded-bl-lg bg-cyan-500 flex items-center justify-center shadow-md">
                                       <CheckSquare size={12} className="text-white" />
                                    </div>
                                  ) : isHovered ? (
                                    <div className="w-5 h-5 rounded-bl-lg bg-white/50 dark:bg-black/50 border-b border-l border-slate-200 dark:border-white/10 flex items-center justify-center">
                                       <Square size={12} className="text-sg-muted" />
                                    </div>
                                  ) : null}
                                </div>

                                <div className="p-3 flex flex-col h-full relative z-10 w-full">
                                    <div className="flex justify-between items-start w-full mb-2">
                                         <span className={`text-[13px] font-black tracking-tight drop-shadow-sm ${sCfg.color}`}>{unit.code}</span>
                                         <div className={`w-2 h-2 mt-1 rounded-[4px] shadow-sm ${sCfg.color} bg-current`} title={sCfg.label} />
                                    </div>
                                    <div className="flex items-end justify-between w-full mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider">{parseFloat(Number(unit.area).toFixed(1))}m²</span>
                                        </div>
                                        <span className="text-[12px] font-black text-sg-heading">{(unit.price / 1000000000).toFixed(1)}B</span>
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
        })}
      </div>
    </div>
  );
}
