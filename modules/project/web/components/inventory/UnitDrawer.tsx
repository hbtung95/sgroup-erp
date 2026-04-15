import React from 'react';
import { X, Lock, Banknote, Handshake, Unlock, User, Phone, Clock, DollarSign, Maximize2, Building2, Compass, MapPin, Eye, Bed, TrendingUp, Loader2, Sparkles, LayoutGrid, CheckSquare } from 'lucide-react';
import { RE_INVENTORY_STATUS, RE_PROPERTY_TYPE } from '../../constants';
import type { REProduct, REProject } from '../../types';

interface UnitDrawerProps {
  unit: REProduct | null;
  projects: REProject[];
  actionLoadingId: string | null;
  onClose: () => void;
  onAction: (id: string, action: 'lock' | 'unlock' | 'deposit' | 'sold', payload?: any) => void;
  onOpenLockModal: (id: string) => void;
}

export function UnitDrawer({ unit, projects, actionLoadingId, onClose, onAction, onOpenLockModal }: UnitDrawerProps) {
  if (!unit) return null;

  const sCfg = RE_INVENTORY_STATUS[unit.status] || RE_INVENTORY_STATUS.AVAILABLE;
  const proj = projects.find(p => p.id === unit.projectId);
  const typeCfg = RE_PROPERTY_TYPE[proj?.type || 'APARTMENT'] || RE_PROPERTY_TYPE.APARTMENT;
  const pricePerM2 = unit.area > 0 ? unit.price / unit.area : 0;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[20px] transition-all duration-500" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-[95] w-full max-w-[500px] bg-white dark:bg-black/80 backdrop-blur-3xl border-l border-slate-200 dark:border-white/5 shadow-[-20px_0_60px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
        
        {/* Cinematic Backdrop Accents */}
        <div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
        <div className={`absolute -top-32 -right-32 w-80 h-80 rounded-full ${sCfg.bg} blur-[100px] opacity-20 pointer-events-none`} />

        {/* Drawer Header */}
        <div className="relative px-8 pt-8 pb-6 border-b border-white/10 dark:border-white/5 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.2)] ${sCfg.bg.replace('/10', '/20')} border ${sCfg.border} relative group`}>
                <div className={`absolute -inset-4 rounded-[32px] border border-${sCfg.color.replace('text-', '')}/30 opacity-50 animate-pulse`} />
                <span className={`text-[22px] font-black ${sCfg.color}`}>{unit.code}</span>
              </div>
              <div className="flex flex-col">
                <h2 className="text-[28px] font-black text-transparent bg-clip-text bg-linear-to-r from-sg-heading to-sg-heading/70 tracking-tight leading-none">{unit.code}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-1 rounded-[6px] text-[9px] font-black uppercase tracking-[0.1em] shadow-sm ${sCfg.bg} ${sCfg.color} ${sCfg.border}`}>{sCfg.label}</span>
                  <span className="text-[11px] font-bold text-sg-muted bg-slate-50 dark:bg-black/40 px-2.5 py-1 rounded-[6px] border border-slate-200 dark:border-white/5">{proj?.code || 'N/A'} • {typeCfg.label}</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 flex items-center justify-center text-sg-muted hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shadow-sm">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-6 flex flex-col gap-6 z-10 relative">
          
          {/* Price Hero Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20 rounded-[24px] p-6 shadow-[0_8px_32px_rgba(16,185,129,0.05)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[40px] group-hover:bg-cyan-500/20 transition-all duration-700" />
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <DollarSign size={18} className="text-emerald-500" />
              <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest drop-shadow-sm">Giá gốc CĐT Ban hành</span>
            </div>
            <div className="text-[40px] font-black text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400 leading-tight drop-shadow-sm relative z-10">
              {(unit.price / 1000000000).toFixed(2)} <span className="text-[18px]">Tỷ VNĐ</span>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-emerald-500/10 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider mb-0.5">Đơn giá/m²</span>
                <span className="text-[15px] font-black text-sg-heading">{(pricePerM2 / 1000000).toFixed(1)} Tr/m²</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider mb-0.5">HH Phân phối</span>
                <span className="text-[15px] font-black text-fuchsia-500 flex items-center gap-1.5"><Sparkles size={14}/> {((unit.commissionAmt || 0) / 1000000).toLocaleString('vi')} Tr</span>
              </div>
            </div>
          </div>

          {/* Property Specs Grid */}
          <div className="bg-slate-50 dark:bg-black/30 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.05)]">
            <h4 className="text-[11px] font-black text-sg-subtext uppercase tracking-widest mb-4 flex items-center gap-2"><LayoutGrid size={14}/> Data Center</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0"><Maximize2 size={18} className="text-cyan-500" /></div>
                <div className="flex flex-col"><p className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider">Diện tích</p><p className="text-[15px] font-black text-sg-heading">{parseFloat(Number(unit.area).toFixed(2))} m²</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0"><Building2 size={18} className="text-indigo-500" /></div>
                <div className="flex flex-col"><p className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider">Tầng/Trệt</p><p className="text-[15px] font-black text-sg-heading">{unit.floor === 0 ? 'Trệt' : `Tầng ${unit.floor}`}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0"><Compass size={18} className="text-amber-500" /></div>
                <div className="flex flex-col"><p className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider">Ban Công</p><p className="text-[15px] font-black text-sg-heading">{unit.direction || 'N/A'}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0"><Bed size={18} className="text-rose-500" /></div>
                <div className="flex flex-col"><p className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider">Phòng ngủ</p><p className="text-[15px] font-black text-sg-heading">{unit.bedrooms} PN</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0"><MapPin size={18} className="text-purple-500" /></div>
                <div className="flex flex-col"><p className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider">Tháp/Block</p><p className="text-[15px] font-black text-sg-heading text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-fuchsia-400">{unit.block}</p></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[14px] bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0"><Eye size={18} className="text-teal-500" /></div>
                <div className="flex flex-col"><p className="text-[10px] font-extrabold text-sg-muted uppercase tracking-wider">Type</p><p className="text-[15px] font-black text-sg-heading line-clamp-1">{unit.unitType || typeCfg.label}</p></div>
              </div>
            </div>
          </div>

          {/* Customer / Booking Info */}
          {(unit.status === 'LOCKED' || unit.status === 'RESERVED' || unit.status === 'DEPOSIT' || unit.status === 'SOLD') && (
            <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-orange-500/20 rounded-[24px] p-6 shadow-[0_4px_24px_rgba(249,115,22,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 blur-[40px]" />
              <h4 className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-5 flex items-center gap-2 relative z-10">
                <User size={14} /> Hồ sơ giao dịch
              </h4>
              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex space-x-12">
                   {unit.customerName && (
                     <div className="flex flex-col gap-0.5 min-w-0">
                       <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Khách hàng</span>
                       <span className="text-[16px] font-black text-sg-heading line-clamp-1">{unit.customerName}</span>
                     </div>
                   )}
                   {unit.customerPhone && (
                     <div className="flex flex-col gap-0.5 min-w-0">
                       <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Liên hệ</span>
                       <span className="text-[16px] font-black text-sg-heading line-clamp-1">{unit.customerPhone}</span>
                     </div>
                   )}
                </div>
                
                <div className="h-px bg-orange-500/10 my-1" />

                <div className="flex items-center justify-between">
                  {unit.bookedBy && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Agent tư vấn</span>
                      <span className="text-[14px] font-black text-orange-500 flex items-center gap-1.5"><Handshake size={14}/> {unit.bookedBy}</span>
                    </div>
                  )}
                  {unit.lockedUntil && unit.status !== 'SOLD' && unit.status !== 'DEPOSIT' && (
                    <div className="flex flex-col gap-0.5 items-end">
                       <span className="text-[10px] font-bold text-sg-muted uppercase tracking-wider">Thời gian Lock</span>
                       <span className="text-[14px] font-black text-rose-500 flex items-center gap-1.5"><Clock size={14}/> {new Date(unit.lockedUntil).toLocaleTimeString('vi-VN')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Drawer Footer Actions */}
        <div className="px-8 py-6 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-black/50 backdrop-blur-3xl flex items-center gap-4 z-20">
          {unit.status === 'AVAILABLE' && (
            <button
              onClick={() => { onClose(); onOpenLockModal(unit.id); }}
              className="flex-1 h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white rounded-2xl text-[14px] font-black transition-all shadow-[0_8px_24px_rgba(249,115,22,0.3)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.4)] hover:-translate-y-1 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl" />
              <Lock size={18} className="relative z-10" /> <span className="relative z-10">Hold & Lock Booking</span>
            </button>
          )}
          {(unit.status === 'LOCKED' || unit.status === 'RESERVED') && (
            <>
              <button
                onClick={() => onAction(unit.id, 'deposit')}
                disabled={actionLoadingId === unit.id}
                className="flex-[2] h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white rounded-2xl text-[14px] font-black transition-all shadow-[0_8px_24px_rgba(59,130,246,0.3)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.4)] hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl" />
                {actionLoadingId === unit.id ? <Loader2 size={18} className="animate-spin relative z-10" /> : <><Banknote size={18} className="relative z-10" /> <span className="relative z-10">Upgrade to Deposit</span></>}
              </button>
              <button
                onClick={() => onAction(unit.id, 'unlock')}
                disabled={actionLoadingId === unit.id}
                className="flex-1 h-14 flex items-center justify-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-sg-heading rounded-2xl text-[14px] font-black text-sg-heading transition-all hover:-translate-y-1 disabled:opacity-50 shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
              >
                <Unlock size={18} /> Cancel
              </button>
            </>
          )}
          {unit.status === 'DEPOSIT' && (
            <button
              onClick={() => onAction(unit.id, 'sold')}
              disabled={actionLoadingId === unit.id}
              className="flex-1 h-14 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white rounded-2xl text-[14px] font-black transition-all shadow-[0_8px_24px_rgba(244,63,94,0.3)] hover:shadow-[0_12px_32px_rgba(244,63,94,0.4)] hover:-translate-y-1 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-2xl" />
              {actionLoadingId === unit.id ? <Loader2 size={18} className="animate-spin relative z-10" /> : <><Handshake size={18} className="relative z-10" /> <span className="relative z-10">Confirm Contract (Sold)</span></>}
            </button>
          )}
          {(unit.status === 'SOLD' || unit.status === 'COMPLETED') && (
            <div className="flex-1 h-14 flex flex-col items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-inner">
               <span className="text-[12px] font-black text-emerald-500 drop-shadow-sm flex items-center gap-1"><CheckSquare size={14}/> CONTRACT CLOSED</span>
               <span className="text-[10px] font-bold text-sg-muted mt-0.5">Contact HR/Finance for more info.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
