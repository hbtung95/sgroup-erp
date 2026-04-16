import React, { useState, useEffect } from 'react';
import { Target, X, CheckCircle2, ChevronDown, Activity, DollarSign } from 'lucide-react';
import { salesOpsApi } from '../api/salesApi';

export interface ActivityEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ACTIVITY_TYPES = [
  { id: 'CALL', label: 'Gọi điện thoại', defaultPoints: 5, icon: 'phone' },
  { id: 'MEET', label: 'Gặp mặt trực tiếp', defaultPoints: 20, icon: 'users' },
  { id: 'DEAL_CLOSED', label: 'Chốt DEAL', defaultPoints: 100, icon: 'award' },
  { id: 'MSG', label: 'Nhắn tin/Email', defaultPoints: 2, icon: 'message-circle' },
];

export function ActivityEntryModal({ isOpen, onClose }: ActivityEntryModalProps) {
  const [type, setType] = useState('CALL');
  const [points, setPoints] = useState(5);
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSuccess(false);
        setType('CALL');
        setPoints(5);
        setValue('');
        setNote('');
      }, 300);
    }
  }, [isOpen]);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const def = ACTIVITY_TYPES.find(t => t.id === newType);
    if (def) setPoints(def.defaultPoints);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await salesOpsApi.createActivity({
        activityType: type as any,
        points: points,
        value: value ? parseFloat(value) : undefined,
        note
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-md bg-white dark:bg-black/80 backdrop-blur-3xl rounded-[32px] border border-white/20 dark:border-sg-border shadow-2xl overflow-hidden sg-stagger"
        style={{ animation: 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className="p-6">
          <button 
            type="button" 
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-sg-card/50 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors border border-sg-border/50 text-sg-muted"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-sg-heading tracking-tight">Nhập Hoạt Động</h2>
              <p className="text-[12px] font-bold text-sg-muted mt-1">Ghi nhận effort của bạn hôm nay</p>
            </div>
          </div>

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-emerald-500">
              <CheckCircle2 size={64} className="animate-bounce" />
              <p className="mt-4 text-[16px] font-black">Ghi nhận thành công!</p>
            </div>
          ) : (
             <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase">Loại Hoạt Động</label>
                <div className="relative">
                  <select 
                    value={type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-sg-card/50 border border-sg-border/50 text-[14px] font-bold text-sg-heading appearance-none focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    {ACTIVITY_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 text-sg-muted pointer-events-none" size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase">Điểm thưởng</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={points}
                      onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                      className="w-full h-12 px-4 pl-10 rounded-xl bg-sg-card/50 border border-sg-border/50 text-[14px] font-black text-sg-heading focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <Target className="absolute left-3.5 top-3.5 text-emerald-500" size={18} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase">Giá trị (VNĐ)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="Không bắt buộc"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className="w-full h-12 px-4 pl-10 rounded-xl bg-sg-card/50 border border-sg-border/50 text-[14px] font-bold text-sg-heading focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <DollarSign className="absolute left-3.5 top-3.5 text-blue-500" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase">Ghi chú chi tiết</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Gọi khách hàng A hỏi về dự án Vinhomes..."
                  className="w-full h-24 p-4 rounded-xl bg-sg-card/50 border border-sg-border/50 text-[13px] font-medium text-sg-heading focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full h-12 mt-2 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 text-white font-black text-[15px] hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden"
              >
                {submitting ? 'Đang gửi...' : 'Ghi Nhận Hoạt Động'}
                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
