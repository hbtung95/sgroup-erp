import React from 'react';
import { Lock, Unlock } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onBulkLock: () => void;
  onBulkUnlock: () => void;
}

export function BulkActionBar({ selectedCount, onClear, onBulkLock, onBulkUnlock }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[80] bg-sg-card border border-sg-border shadow-2xl rounded-2xl p-2.5 flex items-center gap-4 animate-in slide-in-from-bottom-5">
      <div className="px-4 py-2 bg-blue-500/10 rounded-xl border border-blue-500/20 flex flex-col">
        <span className="text-[10px] font-bold text-sg-muted uppercase tracking-widest leading-none">Đã chọn</span>
        <span className="text-[16px] font-black text-blue-500 leading-tight">{selectedCount} <span className="text-[12px] text-sg-subtext">Căn hộ</span></span>
      </div>
      <div className="w-px h-8 bg-sg-border/60" />
      <div className="flex items-center gap-2">
        <button 
          onClick={onBulkLock}
          className="h-11 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[13px] font-black transition-all flex items-center gap-2 shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5"
        >
          <Lock size={16} /> Giữ chỗ hàng loạt
        </button>
        <button 
          onClick={onBulkUnlock}
          className="h-11 px-4 bg-sg-btn-bg border border-sg-border hover:border-sg-heading text-sg-heading rounded-xl text-[13px] font-black transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          <Unlock size={16} /> Mở khóa
        </button>
        <button 
          onClick={onClear}
          className="h-11 px-4 bg-transparent hover:bg-rose-500/10 text-rose-500 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ml-2"
        >
          Bỏ chọn
        </button>
      </div>
    </div>
  );
}
