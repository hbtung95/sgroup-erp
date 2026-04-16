import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, BarChart3, Layers, Settings, FileText,
  ArrowRight, Hash, TrendingUp, Building2,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// SALES SEARCH MODAL — Command Palette (Cmd+K)
// ═══════════════════════════════════════════════════════════

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function SalesSearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const navigateTo = (path: string) => { navigate(path); onClose(); };

  const allResults: SearchResult[] = [
    { id: 'nav-dashboard', label: 'Dashboard', sublabel: 'Tổng quan KPI & doanh số', icon: <BarChart3 size={16} />, action: () => navigateTo('dashboard'), category: 'Navigation' },
    { id: 'nav-customers', label: 'Khách Hàng', sublabel: 'Quản lý CRM & leads', icon: <Users size={16} />, action: () => navigateTo('customers'), category: 'Navigation' },
    { id: 'nav-transactions', label: 'Giao Dịch', sublabel: 'Kanban lock-deposit-sold', icon: <Layers size={16} />, action: () => navigateTo('transactions'), category: 'Navigation' },
    { id: 'nav-team', label: 'Đội Ngũ', sublabel: 'Quản lý Sales Teams', icon: <Users size={16} />, action: () => navigateTo('team'), category: 'Navigation' },
    { id: 'nav-departments', label: 'Phòng Ban', sublabel: 'Khối kinh doanh & KPI phòng', icon: <Building2 size={16} />, action: () => navigateTo('departments'), category: 'Navigation' },
    { id: 'nav-reports', label: 'Báo Cáo', sublabel: 'Plan vs Actual, Team, Project', icon: <FileText size={16} />, action: () => navigateTo('reports'), category: 'Navigation' },
    { id: 'nav-commission', label: 'Hoa Hồng', sublabel: 'Bảng tính commission', icon: <TrendingUp size={16} />, action: () => navigateTo('commission'), category: 'Navigation' },
    { id: 'nav-settings', label: 'Cài Đặt', sublabel: 'Cấu hình module KD', icon: <Settings size={16} />, action: () => navigateTo('settings'), category: 'Navigation' },
    { id: 'act-new-customer', label: 'Thêm khách hàng mới', sublabel: 'Tạo lead mới vào hệ thống', icon: <Hash size={16} />, action: () => navigateTo('customers'), category: 'Actions' },
    { id: 'act-new-deal', label: 'Tạo Deal mới', sublabel: 'Mở giao dịch mới cho khách', icon: <Hash size={16} />, action: () => navigateTo('transactions'), category: 'Actions' },
  ];

  const filtered = query
    ? allResults.filter(r =>
        r.label.toLowerCase().includes(query.toLowerCase()) ||
        r.sublabel.toLowerCase().includes(query.toLowerCase())
      )
    : allResults;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[selectedIndex]) { filtered[selectedIndex].action(); }
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  const categories = [...new Set(filtered.map(r => r.category))];

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[10vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      <div
        className="relative w-full max-w-[640px] bg-white dark:bg-[#0d0d0d]/95 backdrop-blur-3xl rounded-[24px] border border-slate-200 dark:border-sg-border shadow-[0_40px_80px_rgba(0,0,0,0.3)] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 dark:border-sg-border/60">
          <Search size={20} className="text-emerald-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm hoặc nhập lệnh..."
            className="flex-1 bg-transparent text-sg-heading text-[15px] font-semibold placeholder:text-sg-muted outline-none"
          />
          <kbd className="px-2 py-1 bg-sg-btn-bg border border-sg-border rounded-lg text-[10px] font-bold text-sg-muted">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-3">
          {categories.map(cat => (
            <div key={cat}>
              <div className="px-3 py-2 text-[10px] font-black uppercase tracking-[2px] text-sg-muted">{cat}</div>
              {filtered.filter(r => r.category === cat).map((item, idx) => {
                const globalIdx = filtered.indexOf(item);
                const isSelected = globalIdx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(globalIdx)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${
                      isSelected
                        ? 'bg-emerald-500/10 border border-emerald-500/20'
                        : 'border border-transparent hover:bg-sg-card/50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-emerald-500/20 text-emerald-500' : 'bg-sg-btn-bg text-sg-muted'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[13px] font-bold text-sg-heading truncate">{item.label}</span>
                      <span className="block text-[11px] font-medium text-sg-muted truncate">{item.sublabel}</span>
                    </div>
                    {isSelected && <ArrowRight size={14} className="text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-sg-muted">Không tìm thấy kết quả cho "{query}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
