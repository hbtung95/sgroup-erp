import React, { useState, useEffect } from 'react';
import { X, Building2, Save, Loader2 } from 'lucide-react';
import { projectApi } from '../api/projectApi';
import { RE_PROJECT_STATUS, RE_PROPERTY_TYPE } from '../constants';
import type { REProject, REProjectStatus, REPropertyType } from '../types';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProject?: REProject | null;
}

export function ProjectFormModal({ isOpen, onClose, onSuccess, editProject }: ProjectFormModalProps) {
  const isEdit = !!editProject;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    code: '', name: '', description: '', developer: '', location: '',
    type: 'APARTMENT' as REPropertyType, status: 'UPCOMING' as REProjectStatus,
    managerName: '', startDate: '', endDate: '',
  });

  useEffect(() => {
    if (editProject) {
      setForm({
        code: editProject.code || '',
        name: editProject.name || '',
        description: editProject.description || '',
        developer: editProject.developer || '',
        location: editProject.location || '',
        type: editProject.type || 'APARTMENT',
        status: editProject.status || 'UPCOMING',
        managerName: editProject.managerName || '',
        startDate: editProject.startDate?.slice(0, 10) || '',
        endDate: editProject.endDate?.slice(0, 10) || '',
      });
    } else {
      setForm({
        code: '', name: '', description: '', developer: '', location: '',
        type: 'APARTMENT', status: 'UPCOMING', managerName: '', startDate: '', endDate: '',
      });
    }
    setError('');
  }, [editProject, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      setError('Mã dự án và Tên dự án là bắt buộc');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (isEdit && editProject) {
        await projectApi.update(editProject.id, form);
      } else {
        await projectApi.create(form);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-white/95 dark:bg-black/90 backdrop-blur-3xl border border-slate-200 dark:border-sg-border rounded-sg-2xl shadow-[0_32px_64px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-sg-border/60 flex items-center justify-between bg-sg-header/60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-sg-lg bg-linear-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
              <Building2 size={22} className="text-cyan-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-sg-heading tracking-tight">
                {isEdit ? 'Chỉnh sửa Rổ hàng Dự án' : 'Thêm Dự Án Phân Phối'}
              </h2>
              <span className="text-[11px] font-bold text-sg-subtext uppercase tracking-[1.5px]">
                {isEdit ? `Mã: ${editProject?.code}` : 'Thông tin rổ hàng phân phối'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-sg-btn-bg hover:bg-rose-500/10 border border-sg-border hover:border-rose-500/30 flex items-center justify-center transition-all group"
          >
            <X size={18} className="text-sg-muted group-hover:text-rose-500" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[13px] font-bold">
              {error}
            </div>
          )}

          {/* Row: Code + Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-sg-subtext">Mã dự án *</label>
              <input
                value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="VD: SGR"
                disabled={isEdit}
                className="h-12 px-4 bg-sg-bg/80 border border-sg-border rounded-xl text-[14px] font-bold text-sg-heading
                  placeholder:text-sg-muted focus:outline-none focus:border-cyan-500/50 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-sg-subtext">Tên dự án *</label>
              <input
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="VD: SGroup Riverside"
                className="h-12 px-4 bg-sg-bg/80 border border-sg-border rounded-xl text-[14px] font-bold text-sg-heading
                  placeholder:text-sg-muted focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-sg-subtext">Mô tả</label>
            <textarea
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} placeholder="Mô tả ngắn về dự án..."
              className="px-4 py-3 bg-sg-bg/80 border border-sg-border rounded-xl text-[14px] font-semibold text-sg-heading
                placeholder:text-sg-muted focus:outline-none focus:border-cyan-500/50 transition-colors resize-none"
            />
          </div>

          {/* Row: Type + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-sg-subtext">Loại BĐS</label>
              <select
                value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as REPropertyType }))}
                className="h-12 px-4 bg-sg-bg/80 border border-sg-border rounded-xl text-[14px] font-bold text-sg-heading
                  appearance-none focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
              >
                {Object.entries(RE_PROPERTY_TYPE).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-sg-subtext">Trạng thái</label>
              <select
                value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as REProjectStatus }))}
                className="h-12 px-4 bg-sg-bg/80 border border-sg-border rounded-xl text-[14px] font-bold text-sg-heading
                  appearance-none focus:outline-none focus:border-cyan-500/50 transition-colors cursor-pointer"
              >
                {Object.entries(RE_PROJECT_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Developer + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-sg-subtext">Chủ đầu tư</label>
              <input
                value={form.developer} onChange={e => setForm(f => ({ ...f, developer: e.target.value }))}
                placeholder="VD: SGroup Holdings"
                className="h-12 px-4 bg-sg-bg/80 border border-sg-border rounded-xl text-[14px] font-bold text-sg-heading
                  placeholder:text-sg-muted focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-sg-subtext">Vị trí</label>
              <input
                value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                placeholder="VD: TP Thủ Đức, HCM"
                className="h-12 px-4 bg-sg-bg/80 border border-sg-border rounded-xl text-[14px] font-bold text-sg-heading
                  placeholder:text-sg-muted focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Row: Manager + Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-sg-subtext">Người phụ trách</label>
              <input
                value={form.managerName} onChange={e => setForm(f => ({ ...f, managerName: e.target.value }))}
                placeholder="Họ tên"
                className="h-12 px-4 bg-sg-bg/80 border border-sg-border rounded-xl text-[14px] font-bold text-sg-heading
                  placeholder:text-sg-muted focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-sg-subtext">Ngày mở bán</label>
              <input
                type="date" value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="h-12 px-4 bg-sg-bg/80 border border-sg-border rounded-xl text-[14px] font-bold text-sg-heading
                  focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-sg-subtext">Ngày bàn giao</label>
              <input
                type="date" value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="h-12 px-4 bg-sg-bg/80 border border-sg-border rounded-xl text-[14px] font-bold text-sg-heading
                  focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-sg-border/60 flex items-center justify-end gap-3 bg-sg-bg/30">
          <button
            type="button" onClick={onClose}
            className="h-11 px-6 rounded-xl bg-sg-btn-bg hover:bg-sg-card border border-sg-border text-[14px] font-bold text-sg-subtext hover:text-sg-heading transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="h-11 px-6 flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600
              hover:from-cyan-400 hover:to-blue-500 text-white text-[14px] font-black transition-all
              shadow-[0_8px_24px_rgba(6,182,212,0.25)] hover:shadow-[0_12px_32px_rgba(6,182,212,0.4)]
              disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl" />
            {saving ? (
              <Loader2 size={18} className="animate-spin relative z-10" />
            ) : (
              <Save size={18} className="relative z-10" />
            )}
            <span className="relative z-10">{isEdit ? 'Cập nhật' : 'Thêm Dự Án'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
