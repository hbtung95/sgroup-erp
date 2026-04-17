import React, { useState, useEffect } from 'react';
import { Target, X, CheckCircle2, FileText, Phone, Users, Calendar, Award, Building2, AlertCircle } from 'lucide-react';
import { salesOpsApi } from '../api/salesApi';
import { useToast } from '@sgroup/web-ui';

export interface ActivityEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityEntryModal({ isOpen, onClose }: ActivityEntryModalProps) {
  const [callsCount, setCallsCount] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [meetingsMade, setMeetingsMade] = useState(0);
  const [siteVisits, setSiteVisits] = useState(0);
  
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const toast = useToast();

  // Auto calculate points
  const totalPoints = newLeads * 1 + meetingsMade * 10 + siteVisits * 20;

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSuccess(false);
        setCallsCount(0);
        setNewLeads(0);
        setMeetingsMade(0);
        setSiteVisits(0);
        setNote('');
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPoints === 0) return;
    setSubmitting(true);
    try {
      await salesOpsApi.createActivity({
        callsCount,
        newLeads,
        meetingsMade,
        siteVisits,
        note
      });
      toast.success(`+${totalPoints} điểm đã được ghi nhận!`);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      toast.error(err?.message || 'Không thể lưu nhật ký. Vui lòng thử lại.');
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
        className="relative w-full max-w-xl bg-white dark:bg-black/80 backdrop-blur-3xl rounded-sg-2xl border border-white/20 dark:border-sg-border shadow-2xl overflow-hidden sg-stagger"
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
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Calendar size={24} />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-sg-heading tracking-tight">Nhật Ký Tác Nghiệp</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[12px] font-bold text-sg-muted">Ghi nhận hoạt động trong ngày</p>
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold flex items-center gap-1">
                  <Award size={10} /> +{totalPoints} Điểm
                </div>
              </div>
            </div>
          </div>

          {success ? (
            <div className="py-12 flex flex-col items-center justify-center text-emerald-500">
              <CheckCircle2 size={64} className="animate-bounce" />
              <p className="mt-4 text-[16px] font-black">Lưu nhật ký thành công!</p>
            </div>
          ) : (
             <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <FieldInput 
                  label="Cuộc Gọi" 
                  pointsText="0 điểm"
                  value={callsCount} 
                  onChange={setCallsCount} 
                  icon={<Phone size={18} className={callsCount > 0 ? "text-violet-500" : "text-sg-muted"} />}
                  theme="violet"
                />
                <FieldInput 
                  label="Khách Quan Tâm" 
                  pointsText="+1 điểm/khách"
                  value={newLeads} 
                  onChange={setNewLeads} 
                  icon={<Users size={18} className={newLeads > 0 ? "text-emerald-500" : "text-sg-muted"} />}
                  theme="emerald"
                />
                <FieldInput 
                  label="Hẹn Gặp Tư Vấn" 
                  pointsText="+10 điểm/lần"
                  value={meetingsMade} 
                  onChange={setMeetingsMade} 
                  icon={<Target size={18} className={meetingsMade > 0 ? "text-amber-500" : "text-sg-muted"} />}
                  theme="amber"
                />
                <FieldInput 
                  label="Hẹn Gặp Trải Nghiệm" 
                  pointsText="+20 điểm/lần"
                  value={siteVisits} 
                  onChange={setSiteVisits} 
                  icon={<Building2 size={18} className={siteVisits > 0 ? "text-blue-500" : "text-sg-muted"} />}
                  theme="blue"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase">Ghi chú chi tiết</label>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Đã gọi khách hàng A hỏi về dự án..."
                  className="w-full h-24 p-4 rounded-xl bg-sg-card/50 border border-sg-border/50 text-[13px] font-medium text-sg-heading focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting || totalPoints === 0}
                className="w-full h-12 mt-2 rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 text-white font-black text-[15px] hover:shadow-lg hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden"
              >
                {submitting ? 'Đang lưu...' : 'Ghi Nhận Cuối Ngày'}
                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const THEMES: Record<string, any> = {
  indigo: {
    borderActive: 'border-indigo-500/40',
    bgActive: 'bg-indigo-500/10',
    bgLight: 'bg-indigo-500/20',
    text: 'text-indigo-500',
  },
  violet: {
    borderActive: 'border-violet-500/40',
    bgActive: 'bg-violet-500/10',
    bgLight: 'bg-violet-500/20',
    text: 'text-violet-500',
  },
  emerald: {
    borderActive: 'border-emerald-500/40',
    bgActive: 'bg-emerald-500/10',
    bgLight: 'bg-emerald-500/20',
    text: 'text-emerald-500',
  },
  amber: {
    borderActive: 'border-amber-500/40',
    bgActive: 'bg-amber-500/10',
    bgLight: 'bg-amber-500/20',
    text: 'text-amber-500',
  },
  blue: {
    borderActive: 'border-blue-500/40',
    bgActive: 'bg-blue-500/10',
    bgLight: 'bg-blue-500/20',
    text: 'text-blue-500',
  }
};

function FieldInput({ label, value, onChange, icon, pointsText, theme }: any) {
  const isActive = value > 0;
  const tId = THEMES[theme] || THEMES.indigo;

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden ${isActive ? tId.borderActive : 'border-sg-border/50 bg-sg-card/30'}`}>
      {isActive && (
        <div className={`absolute inset-0 ${tId.bgActive} pointer-events-none`} />
      )}
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isActive ? tId.bgLight : 'bg-sg-muted/10'}`}>
            {icon}
          </div>
          <div>
            <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase block leading-tight">{label}</label>
            <span className={`text-[10px] font-bold ${isActive ? tId.text : 'text-sg-muted'}`}>{pointsText}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 relative z-10">
        <button 
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-lg bg-sg-card/80 border border-sg-border flex items-center justify-center text-[18px] font-medium text-sg-heading hover:bg-sg-muted/20 hover:scale-105 active:scale-95 transition-all"
        >
          -
        </button>
        <div className="flex-1 text-center">
          <input 
            type="number" 
            min={0}
            value={value === 0 ? '' : value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            placeholder="0"
            className={`w-full text-center bg-transparent text-[22px] font-black focus:outline-none ${isActive ? tId.text : 'text-sg-heading'}`}
          />
        </div>
        <button 
          type="button"
          onClick={() => onChange(value + 1)}
          className={`w-10 h-10 rounded-lg border flex items-center justify-center text-[18px] font-medium hover:scale-105 active:scale-95 transition-all ${isActive ? `${tId.bgLight} ${tId.borderActive} ${tId.text}` : 'bg-sg-card/80 border-sg-border text-sg-heading hover:bg-sg-muted/20'}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
