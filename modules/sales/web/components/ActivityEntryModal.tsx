import React, { useState, useEffect } from 'react';
import { Target, X, CheckCircle2, FileText, Phone, Users, Calendar, Award } from 'lucide-react';
import { salesOpsApi } from '../api/salesApi';

export interface ActivityEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ActivityEntryModal({ isOpen, onClose }: ActivityEntryModalProps) {
  const [postsCount, setPostsCount] = useState(0);
  const [callsCount, setCallsCount] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [meetingsMade, setMeetingsMade] = useState(0);
  
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto calculate points
  const totalPoints = postsCount * 2 + callsCount * 5 + newLeads * 10 + meetingsMade * 20;

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setSuccess(false);
        setPostsCount(0);
        setCallsCount(0);
        setNewLeads(0);
        setMeetingsMade(0);
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
        postsCount,
        callsCount,
        newLeads,
        meetingsMade,
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
        className="relative w-full max-w-[480px] bg-white dark:bg-black/80 backdrop-blur-3xl rounded-sg-2xl border border-white/20 dark:border-sg-border shadow-2xl overflow-hidden sg-stagger"
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
                  label="Bài Đăng (+2)" 
                  value={postsCount} 
                  onChange={setPostsCount} 
                  icon={<FileText size={16} className="text-indigo-500" />}
                  colorClass="focus:border-indigo-500/50 focus:ring-indigo-500/20"
                />
                <FieldInput 
                  label="Cuộc Gọi (+5)" 
                  value={callsCount} 
                  onChange={setCallsCount} 
                  icon={<Phone size={16} className="text-violet-500" />}
                  colorClass="focus:border-violet-500/50 focus:ring-violet-500/20"
                />
                <FieldInput 
                  label="Khách Quan Tâm (+10)" 
                  value={newLeads} 
                  onChange={setNewLeads} 
                  icon={<Users size={16} className="text-emerald-500" />}
                  colorClass="focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
                <FieldInput 
                  label="Hẹn Gặp (+20)" 
                  value={meetingsMade} 
                  onChange={setMeetingsMade} 
                  icon={<Target size={16} className="text-amber-500" />}
                  colorClass="focus:border-amber-500/50 focus:ring-amber-500/20"
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

function FieldInput({ label, value, onChange, icon, colorClass }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black tracking-wider text-sg-muted uppercase">{label}</label>
      <div className="relative">
        <input 
          type="number" 
          min={0}
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          placeholder="0"
          className={`w-full h-12 px-4 pl-10 rounded-xl bg-sg-card/50 border border-sg-border/50 text-[15px] font-black text-sg-heading focus:outline-none focus:ring-2 transition-all ${colorClass}`}
        />
        <div className="absolute left-3.5 top-3.5 opacity-80">{icon}</div>
      </div>
    </div>
  );
}
