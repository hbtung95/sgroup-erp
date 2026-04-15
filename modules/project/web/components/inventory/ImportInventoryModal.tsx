import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Plus, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import type { REProject } from '../../types';
import { productApi } from '../../api/projectApi';

interface ImportInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projects: REProject[];
}

interface UnitRow {
  code: string;
  block: string;
  floor: string;
  area: string;
  price: string;
  direction: string;
  bedrooms: string;
  commissionAmt: string;
}

const EMPTY_ROW: UnitRow = {
  code: '', block: '', floor: '', area: '', price: '',
  direction: 'Đông', bedrooms: '2', commissionAmt: '',
};

const DIRECTIONS = ['Đông', 'Tây', 'Nam', 'Bắc', 'Đông Bắc', 'Đông Nam', 'Tây Bắc', 'Tây Nam'];

export function ImportInventoryModal({ isOpen, onClose, onSuccess, projects }: ImportInventoryModalProps) {
  const [tab, setTab] = useState<'form' | 'csv'>('form');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [rows, setRows] = useState<UnitRow[]>([{ ...EMPTY_ROW }]);
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);

  const updateRow = (idx: number, key: keyof UnitRow, value: string) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [key]: value } : r));
  };

  const addRow = () => setRows(prev => [...prev, { ...EMPTY_ROW }]);
  const removeRow = (idx: number) => setRows(prev => prev.filter((_, i) => i !== idx));

  const parseCsv = useCallback((text: string): UnitRow[] => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];

    // Skip header
    return lines.slice(1).map(line => {
      const cols = line.split(/[,;\t]/).map(c => c.trim());
      return {
        code: cols[0] || '',
        block: cols[1] || '',
        floor: cols[2] || '',
        area: cols[3] || '',
        price: cols[4] || '',
        direction: cols[5] || 'Đông',
        bedrooms: cols[6] || '2',
        commissionAmt: cols[7] || '',
      };
    }).filter(r => r.code);
  }, []);

  const handleSubmit = async () => {
    if (!projectId) {
      alert('Vui lòng chọn dự án');
      return;
    }

    const dataRows = tab === 'csv' ? parseCsv(csvText) : rows;
    const validRows = dataRows.filter(r => r.code && r.area && r.price);

    if (validRows.length === 0) {
      alert('Không có dữ liệu hợp lệ để nhập. Kiểm tra lại Mã căn, Diện tích, và Giá bán.');
      return;
    }

    setLoading(true);
    setResult(null);
    const errors: string[] = [];
    let success = 0;

    for (const row of validRows) {
      try {
        await productApi.create(projectId, {
          code: row.code,
          block: row.block || undefined,
          floor: row.floor ? parseInt(row.floor) : undefined,
          area: parseFloat(row.area),
          price: parseFloat(row.price),
          direction: row.direction || undefined,
          bedrooms: row.bedrooms ? parseInt(row.bedrooms) : undefined,
        });
        success++;
      } catch (err: any) {
        errors.push(`${row.code}: ${err.message || 'Lỗi không xác định'}`);
      }
    }

    setResult({ success, errors });
    setLoading(false);
    if (success > 0) onSuccess();
  };

  const handleReset = () => {
    setRows([{ ...EMPTY_ROW }]);
    setCsvText('');
    setResult(null);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-[95vw] max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900/95 backdrop-blur-3xl rounded-3xl border border-slate-200 dark:border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Upload size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-[22px] font-black text-sg-heading tracking-tight">Nhập Rổ Hàng</h2>
              <p className="text-[13px] font-bold text-sg-muted mt-0.5">Thêm sản phẩm vào kho hàng tổng</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-sg-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Project Selector */}
        <div className="px-8 pt-6 pb-4">
          <label className="text-[12px] font-black text-sg-muted uppercase tracking-wider mb-2 block">Dự án đích</label>
          <select
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            className="w-full h-12 px-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-[14px] font-bold text-sg-heading appearance-none cursor-pointer focus:outline-none focus:border-cyan-500/50 transition-colors"
          >
            <option value="">— Chọn dự án —</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
          </select>
        </div>

        {/* Tab Switcher */}
        <div className="px-8 flex items-center gap-2">
          <button
            onClick={() => setTab('form')}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-black transition-all ${tab === 'form' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-sg-muted hover:text-sg-heading'}`}
          >
            <Plus size={14} className="inline mr-1.5 -mt-0.5" />
            Nhập thủ công
          </button>
          <button
            onClick={() => setTab('csv')}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-black transition-all ${tab === 'csv' ? 'bg-cyan-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 text-sg-muted hover:text-sg-heading'}`}
          >
            <FileSpreadsheet size={14} className="inline mr-1.5 -mt-0.5" />
            Dán từ Excel / CSV
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          {tab === 'form' ? (
            <div className="flex flex-col gap-3">
              {/* Column headers */}
              <div className="grid grid-cols-[1fr_0.7fr_0.5fr_0.7fr_1fr_0.8fr_0.5fr_40px] gap-2 px-1">
                <span className="text-[10px] font-black text-sg-muted uppercase tracking-wider">Mã căn *</span>
                <span className="text-[10px] font-black text-sg-muted uppercase tracking-wider">Block</span>
                <span className="text-[10px] font-black text-sg-muted uppercase tracking-wider">Tầng</span>
                <span className="text-[10px] font-black text-sg-muted uppercase tracking-wider">Diện tích (m²) *</span>
                <span className="text-[10px] font-black text-sg-muted uppercase tracking-wider">Giá bán (VNĐ) *</span>
                <span className="text-[10px] font-black text-sg-muted uppercase tracking-wider">Hướng</span>
                <span className="text-[10px] font-black text-sg-muted uppercase tracking-wider">PN</span>
                <span />
              </div>

              {rows.map((row, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_0.7fr_0.5fr_0.7fr_1fr_0.8fr_0.5fr_40px] gap-2 group">
                  <input value={row.code} onChange={e => updateRow(idx, 'code', e.target.value)} placeholder="A-01-01" className="h-10 px-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg text-[13px] font-bold text-sg-heading focus:outline-none focus:border-cyan-500/50 placeholder:text-sg-muted/40" />
                  <input value={row.block} onChange={e => updateRow(idx, 'block', e.target.value)} placeholder="A" className="h-10 px-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg text-[13px] font-bold text-sg-heading focus:outline-none focus:border-cyan-500/50 placeholder:text-sg-muted/40" />
                  <input value={row.floor} onChange={e => updateRow(idx, 'floor', e.target.value)} placeholder="1" type="number" className="h-10 px-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg text-[13px] font-bold text-sg-heading focus:outline-none focus:border-cyan-500/50 placeholder:text-sg-muted/40" />
                  <input value={row.area} onChange={e => updateRow(idx, 'area', e.target.value)} placeholder="85.5" type="number" step="0.01" className="h-10 px-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg text-[13px] font-bold text-sg-heading focus:outline-none focus:border-cyan-500/50 placeholder:text-sg-muted/40" />
                  <input value={row.price} onChange={e => updateRow(idx, 'price', e.target.value)} placeholder="5000000000" type="number" className="h-10 px-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg text-[13px] font-bold text-sg-heading focus:outline-none focus:border-cyan-500/50 placeholder:text-sg-muted/40" />
                  <select value={row.direction} onChange={e => updateRow(idx, 'direction', e.target.value)} className="h-10 px-2 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg text-[12px] font-bold text-sg-heading focus:outline-none focus:border-cyan-500/50 appearance-none cursor-pointer">
                    {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input value={row.bedrooms} onChange={e => updateRow(idx, 'bedrooms', e.target.value)} placeholder="2" type="number" min="1" max="10" className="h-10 px-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg text-[13px] font-bold text-sg-heading focus:outline-none focus:border-cyan-500/50 placeholder:text-sg-muted/40" />
                  <button onClick={() => removeRow(idx)} disabled={rows.length <= 1} className="w-10 h-10 rounded-lg flex items-center justify-center text-sg-muted hover:text-rose-500 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button onClick={addRow} className="mt-2 h-10 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/10 text-[13px] font-bold text-sg-muted hover:text-cyan-500 hover:border-cyan-500/30 transition-colors">
                <Plus size={16} />
                Thêm dòng
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
                <p className="text-[12px] font-bold text-sg-muted mb-3 leading-relaxed">
                  Dán dữ liệu từ Excel hoặc CSV theo định dạng:
                </p>
                <div className="bg-white dark:bg-black/40 rounded-xl p-3 border border-slate-200 dark:border-white/5 font-mono text-[11px] text-sg-muted leading-relaxed overflow-x-auto">
                  <span className="text-cyan-500">Mã căn</span>, <span className="text-cyan-500">Block</span>, <span className="text-cyan-500">Tầng</span>, <span className="text-cyan-500">Diện tích</span>, <span className="text-cyan-500">Giá bán</span>, <span className="text-cyan-500">Hướng</span>, <span className="text-cyan-500">Phòng ngủ</span><br />
                  A-01-01, A, 1, 85.5, 5000000000, Đông Nam, 2<br />
                  A-01-02, A, 1, 72.3, 4200000000, Tây Bắc, 1
                </div>
                <p className="text-[11px] font-bold text-amber-500 mt-2">
                  ⚠ Hỗ trợ dấu phân cách: dấu phẩy (,), chấm phẩy (;) hoặc tab
                </p>
              </div>

              <textarea
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder="Dán dữ liệu tại đây..."
                className="w-full h-48 px-4 py-3 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-[13px] font-mono text-sg-heading focus:outline-none focus:border-cyan-500/50 resize-none placeholder:text-sg-muted/40"
              />

              {csvText && (
                <div className="flex items-center gap-2 text-[12px] font-bold text-sg-muted">
                  <FileSpreadsheet size={14} className="text-cyan-500" />
                  Phát hiện {parseCsv(csvText).length} dòng dữ liệu hợp lệ
                </div>
              )}
            </div>
          )}

          {/* Result feedback */}
          {result && (
            <div className="mt-6 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl p-5">
              {result.success > 0 && (
                <div className="flex items-center gap-2 text-emerald-500 text-[14px] font-bold mb-3">
                  <CheckCircle2 size={18} />
                  Đã nhập thành công {result.success} sản phẩm
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-rose-500 text-[13px] font-bold">
                    <AlertCircle size={16} />
                    {result.errors.length} lỗi xảy ra:
                  </div>
                  <ul className="list-disc pl-6 text-[12px] font-bold text-rose-400 max-h-32 overflow-y-auto">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <button onClick={handleReset} className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-sg-muted hover:text-sg-heading bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
            Đặt lại
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-sg-muted hover:text-sg-heading transition-colors">
              Đóng
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !projectId}
              className="h-12 px-8 flex items-center gap-2 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white font-black text-[14px] shadow-[0_8px_20px_rgba(6,182,212,0.3)] transition-all hover:-translate-y-0.5 relative overflow-hidden group"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang nhập...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Nhập {tab === 'csv' && csvText ? `${parseCsv(csvText).length} căn` : `${rows.filter(r => r.code && r.area && r.price).length} căn`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
