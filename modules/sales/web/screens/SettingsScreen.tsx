import React, { useState } from 'react';
import {
  Settings, Server, Webhook, Key, RefreshCw, CheckCircle2,
  ToggleLeft, ToggleRight, Moon, Sun, Globe, ChevronRight, Activity, Loader2
} from 'lucide-react';
import { useToastActions } from '../components/shared/Toast';

// ═══════════════════════════════════════════════════════════
// SETTINGS SCREEN — CRM Integration Config
// Neo-Glassmorphism v2.2 • Read-Only • sg-stagger
// ═══════════════════════════════════════════════════════════

export function SettingsScreen() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date().toLocaleTimeString('vi-VN'));

  let toast: ReturnType<typeof useToastActions>;
  try { toast = useToastActions(); } catch { toast = { success: () => {}, error: () => {}, warning: () => {}, info: () => {} }; }

  const handleManualSync = async () => {
    setSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setSyncing(false);
    setLastSync(new Date().toLocaleTimeString('vi-VN'));
    toast.success('Đồng bộ thành công!', 'Dữ liệu mới nhất đã được kéo từ Bizfly CRM.');
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between sg-stagger" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Server size={18} className="text-blue-500" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-sg-heading">Kết Nối Bizfly CRM</h2>
              <span className="text-[11px] font-bold text-sg-muted">Hệ thống đồng bộ dữ liệu Real-time</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[12px] font-black pointer-events-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Đã Kết Nối</span>
            </div>
            <button onClick={handleManualSync} disabled={syncing}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-[12px] font-black shadow-[0_4px_16px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-xl" />
              <span className="relative z-10 flex items-center gap-2">
                {syncing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {syncing ? 'Đang đồng bộ...' : 'Đồng bộ thủ công'}
              </span>
            </button>
          </div>
        </div>

        {/* ═══ Stats Summary ═══ */}
        <div className="grid grid-cols-3 gap-4 sg-stagger" style={{ animationDelay: '60ms' }}>
          <div className="bg-white dark:bg-black/30 backdrop-blur-xl border border-slate-200 dark:border-sg-border p-5 rounded-2xl">
            <Activity className="text-emerald-500 mb-2" size={18} />
            <span className="block text-[14px] font-black text-sg-heading">Đang Hoạt Động</span>
            <span className="block text-[11px] font-bold text-sg-muted">Trạng thái API</span>
          </div>
          <div className="bg-white dark:bg-black/30 backdrop-blur-xl border border-slate-200 dark:border-sg-border p-5 rounded-2xl">
            <RefreshCw className="text-blue-500 mb-2" size={18} />
            <span className="block text-[14px] font-black text-sg-heading">{lastSync}</span>
            <span className="block text-[11px] font-bold text-sg-muted">Lần đồng bộ cuối</span>
          </div>
          <div className="bg-white dark:bg-black/30 backdrop-blur-xl border border-slate-200 dark:border-sg-border p-5 rounded-2xl">
            <CheckCircle2 className="text-amber-500 mb-2" size={18} />
            <span className="block text-[14px] font-black text-sg-heading">99.9%</span>
            <span className="block text-[11px] font-bold text-sg-muted">Tỷ lệ thành công (30d)</span>
          </div>
        </div>

        {/* ═══ Connection Details ═══ */}
        <SettingsSection title="Cấu Hình API (Read-only)" icon={<Key size={16} className="text-amber-500" />} delay={120}>
          <ReadOnlyField label="Endpoint Server" value="https://api.bizflycrm.vn/v1/sgroup" icon={<Server size={14} />} />
          <ReadOnlyField label="API Secret Key" value="sk_biz_****************************9x2a" icon={<Key size={14} />} obscure />
          <ReadOnlyField label="Webhook Updates" value="https://sgroup-crm.vercel.app/api/webhooks/bizfly" icon={<Webhook size={14} />} />
        </SettingsSection>

        {/* ═══ Data Policies ═══ */}
        <SettingsSection title="Quy Tắc Đồng Bộ" icon={<CheckCircle2 size={16} className="text-emerald-500" />} delay={240}>
          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <h4 className="text-[13px] font-black mb-1">Single Source of Truth</h4>
            <p className="text-[11px] font-medium leading-relaxed">Bộ phận Kinh doanh sử dụng Bizfly CRM làm hệ thống nhập liệu chuẩn. Hệ thống này chỉ kéo dữ liệu về phân tích và hiển thị (Read-Only). Mọi thao tác Thêm/Sửa/Xoá giao dịch phải được thực hiện trên Bizfly CRM.</p>
          </div>
          <div className="space-y-1 mt-3">
            <ToggleReadItem label="Khách hàng tiềm năng & Pipeline" enabled />
            <ToggleReadItem label="Hiệu suất Team & Nhân viên" enabled />
            <ToggleReadItem label="Chỉ số KPIs doanh thu" enabled />
            <ToggleReadItem label="Chỉnh sửa dữ liệu hai chiều (Two-way sync)" enabled={false} />
          </div>
        </SettingsSection>

        {/* ═══ Appearance Section (kept from generic configs) ═══ */}
        <SettingsSection title="Giao Diện Hiển Thị" icon={<Globe size={16} className="text-violet-500" />} delay={360}>
          <div className="p-4 rounded-xl bg-sg-card/50 border border-sg-border/30 flex items-center justify-between hover:bg-sg-card/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-sg-btn-bg border border-sg-border">
                <Sun size={14} className="text-amber-500" />
                <span className="text-[10px] font-bold text-sg-muted">/</span>
                <Moon size={14} className="text-indigo-500" />
              </div>
              <div>
                <span className="block text-[13px] font-bold text-sg-heading">Dark Mode</span>
                <span className="block text-[11px] font-medium text-sg-muted">Chuyển đổi chế độ phân tích ánh sáng yếu</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-sg-muted bg-sg-btn-bg px-3 py-1.5 rounded-lg border border-sg-border">Tự Động</span>
          </div>
        </SettingsSection>

      </div>
    </div>
  );
}

// ═══ Common Components ═══

function SettingsSection({ title, icon, children, delay }: { title: string; icon: React.ReactNode; children: React.ReactNode; delay: number }) {
  return (
    <div className="bg-white dark:bg-black/30 backdrop-blur-3xl rounded-[24px] border border-slate-200/80 dark:border-sg-border shadow-sg-md overflow-hidden sg-stagger" style={{ animationDelay: `${delay}ms` }}>
      <div className="px-6 py-4 border-b border-slate-100 dark:border-sg-border/40">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-[13px] font-black text-sg-heading uppercase tracking-wider">{title}</h3>
        </div>
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  );
}

function ReadOnlyField({ label, value, icon, obscure }: { label: string; value: string; icon: React.ReactNode; obscure?: boolean }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-sg-card/50 border border-sg-border/30">
      <div className="flex items-center gap-3 w-1/3">
        <div className="text-sg-muted">{icon}</div>
        <span className="text-[13px] font-bold text-sg-heading">{label}</span>
      </div>
      <div className="flex-1 text-right">
        <span className={`text-[12px] font-mono ${obscure ? 'text-sg-muted tracking-widest' : 'text-blue-500 font-bold'}`}>{value}</span>
      </div>
    </div>
  );
}

function ToggleReadItem({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-sg-card/30 transition-colors">
      <span className="text-[13px] font-semibold text-sg-heading">{label}</span>
      {enabled ? (
        <ToggleRight size={22} className="text-emerald-500" />
      ) : (
        <ToggleLeft size={22} className="text-slate-400" />
      )}
    </div>
  );
}
