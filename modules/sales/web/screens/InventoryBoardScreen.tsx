import React, { useState, useMemo } from 'react';
import {
  Building2, Grid, Layers, MapMapPin, Filter, Plus,
  CheckCircle2, Clock, Lock, Banknote, DollarSign,
  ChevronRight, RefreshCw, Box
} from 'lucide-react';
import { CinematicDrawer, DrawerSection, DrawerDetailRow } from '../components/shared';

// ═══════════════════════════════════════════════════════════
// INVENTORY BOARD SCREEN
// Neo-Glassmorphism v2.2 • sg-stagger animations
// ═══════════════════════════════════════════════════════════

type UnitStatus = 'AVAILABLE' | 'BOOKED' | 'LOCKED' | 'DEPOSIT' | 'SOLD';

interface ProductUnit {
  id: string;
  code: string;
  block: string;
  floor: number;
  status: UnitStatus;
  price: number;
  area: number;
  bedrooms: number;
}

const STATUS_CONFIG: Record<UnitStatus, { label: string, colorClass: string, bgClass: string, icon: any }> = {
  AVAILABLE: { label: 'Trống', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500', icon: CheckCircle2 },
  BOOKED:    { label: 'Booking', colorClass: 'text-blue-500', bgClass: 'bg-blue-500', icon: Clock },
  LOCKED:    { label: 'Đã Lock', colorClass: 'text-amber-500', bgClass: 'bg-amber-500', icon: Lock },
  DEPOSIT:   { label: 'Đã Cọc', colorClass: 'text-pink-500', bgClass: 'bg-pink-500', icon: Banknote },
  SOLD:      { label: 'Đã Bán', colorClass: 'text-purple-500', bgClass: 'bg-purple-500', icon: DollarSign },
};

const formatVND = (n: number) => Math.round(n).toLocaleString('vi-VN');

// Mock Data Generator
const generateMockInventory = (): ProductUnit[] => {
  const data: ProductUnit[] = [];
  const blocks = ['A', 'B'];
  const floors = [1, 2, 3, 4, 5, 6, 7];
  const unitsPerFloor = 8;
  const statuses: UnitStatus[] = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'BOOKED', 'LOCKED', 'DEPOSIT', 'SOLD'];

  blocks.forEach(block => {
    floors.forEach(floor => {
      for (let i = 1; i <= unitsPerFloor; i++) {
        const idStr = `${Math.floor(Math.random() * 1000)}`;
        data.push({
          id: `U-${block}-${floor}-${i}-${idStr}`,
          code: `${block}${floor.toString().padStart(2, '0')}.${i.toString().padStart(2, '0')}`,
          block,
          floor,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          price: 2500000000 + Math.random() * 3000000000,
          area: 50 + Math.random() * 50,
          bedrooms: Math.floor(1 + Math.random() * 3),
        });
      }
    });
  });
  return data;
};

const MOCK_DATA = generateMockInventory();

export function InventoryBoardScreen() {
  const [units, setUnits] = useState<ProductUnit[]>(MOCK_DATA);
  const [selectedBlock, setSelectedBlock] = useState<string>('A');
  const [filterStatus, setFilterStatus] = useState<UnitStatus | 'ALL'>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit | null>(null);

  // Computed data
  const blocks = useMemo(() => Array.from(new Set(units.map(u => u.block))).sort(), [units]);
  
  const filteredUnits = useMemo(() => {
    return units.filter(u => u.block === selectedBlock && (filterStatus === 'ALL' || u.status === filterStatus));
  }, [units, selectedBlock, filterStatus]);

  // Group by floor (descending)
  const floors = useMemo(() => {
    const fSet = new Set(filteredUnits.map(u => u.floor));
    return Array.from(fSet).sort((a, b) => b - a);
  }, [filteredUnits]);

  const stats = useMemo(() => {
    const st: Record<string, number> = { AVAILABLE: 0, BOOKED: 0, LOCKED: 0, DEPOSIT: 0, SOLD: 0, ALL: units.length };
    units.forEach(u => st[u.status]++);
    return st;
  }, [units]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-black/20 relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="px-6 lg:px-8 py-5 border-b border-slate-200/50 dark:border-sg-border/40 bg-white/40 dark:bg-black/20 backdrop-blur-xl relative z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-linear-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Grid size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-sg-heading tracking-tight">SGroup Royal City</h2>
              <span className="text-[12px] font-bold text-sg-muted flex items-center gap-2 mt-1">
                <Box size={14} /> Tổng {stats.ALL} sản phẩm căn hộ 
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setUnits(generateMockInventory())} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl text-[12px] font-bold text-sg-heading transition-colors">
              <RefreshCw size={14} /> Tải lại
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-[12px] font-black shadow-lg transition-all hover:-translate-y-1">
              <Filter size={14} /> Mở bán
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-10 p-4 lg:p-6 gap-6">
        {/* Left Sidebar: Controls & Legend */}
        <div className="w-full lg:w-72 flex flex-col gap-6 sg-stagger shrink-0">
          {/* Block Selection */}
          <div className="bg-white/60 dark:bg-sg-card border border-slate-200/60 dark:border-sg-border rounded-[20px] p-5 shadow-sg-sm backdrop-blur-2xl">
            <h3 className="text-[13px] font-black text-sg-heading uppercase tracking-widest mb-4">Chọn Tòa (Block)</h3>
            <div className="grid grid-cols-2 gap-3">
              {blocks.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBlock(b)}
                  className={`py-3 rounded-sg-md text-[15px] font-black border transition-all ${
                    selectedBlock === b
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-50 dark:bg-white/5 border-transparent text-sg-muted hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  Block {b}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters & Legend */}
          <div className="bg-white/60 dark:bg-sg-card border border-slate-200/60 dark:border-sg-border rounded-[20px] p-5 shadow-sg-sm backdrop-blur-2xl">
            <h3 className="text-[13px] font-black text-sg-heading uppercase tracking-widest mb-4">Trạng Thái</h3>
            <div className="space-y-2">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  filterStatus === 'ALL' ? 'bg-slate-100 border-slate-300 dark:bg-white/10 dark:border-white/20' : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className={`text-[13px] font-bold ${filterStatus === 'ALL' ? 'text-sg-heading' : 'text-sg-muted'}`}>Tất cả</span>
                </div>
                <span className="text-[12px] font-black">{stats.ALL}</span>
              </button>

              {(Object.keys(STATUS_CONFIG) as Array<UnitStatus>).map(status => {
                const conf = STATUS_CONFIG[status];
                const isActive = filterStatus === status;
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isActive ? `${conf.bgClass}/10 border-${conf.colorClass.split('-')[1]}-500/30` : 'border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${conf.bgClass} shadow-sm shadow-${conf.colorClass.split('-')[1]}-500/50`} />
                      <span className={`text-[13px] font-bold ${isActive ? 'text-sg-heading' : 'text-sg-muted'}`}>{conf.label}</span>
                    </div>
                    <span className={`text-[12px] font-black ${conf.colorClass}`}>{stats[status]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content: Board Grid */}
        <div className="flex-1 bg-white/60 dark:bg-sg-card border border-slate-200/60 dark:border-sg-border rounded-sg-xl shadow-sg-sm backdrop-blur-2xl overflow-hidden flex flex-col sg-stagger" style={{ animationDelay: '100ms' }}>
          <div className="p-5 border-b border-slate-200/60 dark:border-sg-border flex justify-between items-center bg-white/40 dark:bg-black/20">
            <h3 className="text-[15px] font-black text-sg-heading flex items-center gap-2">
              <Building2 size={16} className="text-cyan-500" /> Bảng hàng chi tiết: Block {selectedBlock}
            </h3>
          </div>
          
          <div className="flex-1 overflow-auto custom-scrollbar p-6">
            <div className="space-y-6 min-w-[600px]">
              {floors.map(floor => {
                const floorUnits = filteredUnits.filter(u => u.floor === floor).sort((a, b) => a.code.localeCompare(b.code));
                if (floorUnits.length === 0) return null;

                return (
                  <div key={floor} className="flex gap-4">
                    {/* Floor Label */}
                    <div className="w-16 shrink-0 flex items-center justify-center">
                       <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex flex-col items-center justify-center text-cyan-600 dark:text-cyan-400">
                          <span className="text-[10px] font-black tracking-widest">TẦNG</span>
                          <span className="text-[18px] font-black leading-none">{floor}</span>
                       </div>
                    </div>
                    {/* Units Grid */}
                    <div className="flex-1 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {floorUnits.map(unit => {
                        const conf = STATUS_CONFIG[unit.status];
                        return (
                          <div
                            key={unit.id}
                            onClick={() => setSelectedUnit(unit)}
                            className={`aspect-square rounded-2xl border ${conf.bgClass}/10 border-${conf.colorClass.split('-')[1]}-500/20 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:shadow-${conf.colorClass.split('-')[1]}-500/20 group relative overflow-hidden`}
                          >
                             {/* Background Fill based on status */}
                             <div className={`absolute inset-0 ${conf.bgClass} opacity-5 dark:opacity-10`} />
                             
                             <div className="text-[14px] font-black text-sg-heading relative z-10 group-hover:text-cyan-500 transition-colors">
                               {unit.code.split('.')[1]}
                             </div>
                             <div className={`text-[10px] font-bold mt-1 uppercase tracking-wider ${conf.colorClass} relative z-10`}>
                               {conf.label}
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {floors.length === 0 && (
                <div className="flex-1 flex items-center justify-center min-h-[300px]">
                  <p className="text-sg-muted text-[13px] font-bold">Không tìm thấy sản phẩm phù hợp điều kiện lọc.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Drawer for Unit Details */}
      <CinematicDrawer
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        title={`Căn hộ ${selectedUnit?.code}`}
        subtitle={selectedUnit ? STATUS_CONFIG[selectedUnit.status].label : ''}
        icon={selectedUnit ? <Layers size={24} className={STATUS_CONFIG[selectedUnit.status].colorClass} /> : undefined}
        accentColor={
          selectedUnit?.status === 'AVAILABLE' ? 'emerald' :
          selectedUnit?.status === 'SOLD' ? 'purple' :
          selectedUnit?.status === 'DEPOSIT' ? 'pink' :
          selectedUnit?.status === 'BOOKED' ? 'blue' : 'amber'
        }
        footer={selectedUnit?.status === 'AVAILABLE' ? (
          <div className="flex gap-3">
             <button className="flex-1 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl text-[14px] font-black transition-all hover:-translate-y-1 shadow-lg shadow-blue-500/20">
               Booking (Giữ chỗ)
             </button>
             <button className="flex-1 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-[14px] font-black transition-all hover:-translate-y-1 shadow-lg shadow-amber-500/20">
               Khóa SP (Lock)
             </button>
          </div>
        ) : undefined}
      >
        {selectedUnit && (
          <>
            <div className="py-6 flex items-end gap-2 border-b border-sg-border/50 mb-6">
              <span className="text-[32px] font-black text-sg-heading leading-none">{(selectedUnit.price / 1000000000).toFixed(2)}</span>
              <span className="text-[14px] font-bold text-sg-muted mb-1">Tỷ VNĐ</span>
            </div>

            <DrawerSection title="Thông Số Sản Phẩm">
              <div className="grid grid-cols-1 gap-4">
                 <DrawerDetailRow icon={<Building2 size={16} className="text-cyan-500" />} label="Dự án" value="SGroup Royal City" />
                 <DrawerDetailRow icon={<Layers size={16} className="text-indigo-500" />} label="Mã sản phẩm" value={selectedUnit.code} />
                 <DrawerDetailRow label="Tòa (Block)" value={selectedUnit.block} />
                 <DrawerDetailRow label="Tầng" value={selectedUnit.floor} />
              </div>
            </DrawerSection>
            
            <DrawerSection title="Chi tiết Kỹ Thuật" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                 <DrawerDetailRow label="Diện tích (thông thủy)" value={`${selectedUnit.area.toFixed(1)} m²`} />
                 <DrawerDetailRow label="Số phòng ngủ" value={`${selectedUnit.bedrooms} PN`} />
              </div>
            </DrawerSection>
          </>
        )}
      </CinematicDrawer>
    </div>
  );
}
