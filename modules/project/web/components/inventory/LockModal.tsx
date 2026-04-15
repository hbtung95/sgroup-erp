import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';

interface LockModalProps {
  unitId: string | null;
  loadingId: string | null;
  onClose: () => void;
  onConfirm: (unitId: string, payload: { customerName: string; customerPhone: string }) => void;
  isBulk?: boolean;
  bulkCount?: number;
}

export function LockModal({ unitId, loadingId, onClose, onConfirm, isBulk, bulkCount }: LockModalProps) {
  const [form, setForm] = useState({ name: '', phone: '' });

  if (!unitId) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-sg-card border border-sg-border rounded-xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-orange-500" />
        <h3 className="text-lg font-black text-sg-heading mb-4 flex items-center gap-2">
          <Lock size={18} className="text-orange-500" /> {isBulk ? `Khóa Hàng Loạt (${bulkCount} Căn)` : 'Lock Giữ Chỗ'}
        </h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[12px] font-bold text-sg-subtext mb-1.5 block">Tên khách hàng *</label>
            <input 
              type="text" 
              autoFocus
              placeholder="Nguyễn Văn A" 
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full h-11 px-4 bg-sg-bg border border-sg-border rounded-lg text-[14px] font-bold text-sg-heading focus:border-orange-500 transition-colors outline-none"
            />
          </div>
          <div>
            <label className="text-[12px] font-bold text-sg-subtext mb-1.5 block">Số điện thoại *</label>
            <input 
              type="text" 
              placeholder="0909 xxx xxx" 
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              className="w-full h-11 px-4 bg-sg-bg border border-sg-border rounded-lg text-[14px] font-bold text-sg-heading focus:border-orange-500 transition-colors outline-none"
            />
          </div>
          <div className="flex justify-end gap-3 mt-2">
            <button 
              onClick={() => { onClose(); setForm({ name: '', phone: '' }); }}
              className="px-4 py-2 text-[13px] font-bold text-sg-muted hover:text-sg-heading transition-colors"
            >
              Hủy
            </button>
            <button 
              onClick={() => {
                if (!form.name || !form.phone) return alert('Vui lòng nhập tên và SĐT khách hàng');
                onConfirm(unitId, { customerName: form.name, customerPhone: form.phone });
                setForm({ name: '', phone: '' });
              }}
              disabled={loadingId === unitId}
              className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-[13px] font-black transition-colors flex items-center justify-center min-w-[100px]"
            >
              {loadingId === unitId ? <Loader2 size={16} className="animate-spin" /> : 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
