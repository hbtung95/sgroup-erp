export const RE_PROJECT_STATUS: Record<string, { label: string; bg: string; color: string; border: string; iconBg: string }> = {
  UPCOMING: { label: 'Sắp mở bán', bg: 'bg-purple-500/15', color: 'text-purple-500', border: 'border-purple-500/20', iconBg: 'bg-purple-500/20' },
  SELLING: { label: 'Đang mở bán', bg: 'bg-emerald-500/15', color: 'text-emerald-500', border: 'border-emerald-500/20', iconBg: 'bg-emerald-500/20' },
  HANDOVER: { label: 'Đang bàn giao', bg: 'bg-blue-500/15', color: 'text-blue-500', border: 'border-blue-500/20', iconBg: 'bg-blue-500/20' },
  CLOSED: { label: 'Đóng/Hết hàng', bg: 'bg-slate-500/15', color: 'text-slate-400', border: 'border-slate-500/20', iconBg: 'bg-slate-500/20' },
};

export const RE_PROPERTY_TYPE: Record<string, { label: string; bg: string; color: string; border: string }> = {
  LAND: { label: 'Đất nền', bg: 'bg-amber-500/10', color: 'text-amber-500', border: 'border-amber-500/20' },
  APARTMENT: { label: 'Căn hộ chung cư', bg: 'bg-cyan-500/10', color: 'text-cyan-500', border: 'border-cyan-500/20' },
  VILLA: { label: 'Biệt thự', bg: 'bg-indigo-500/10', color: 'text-indigo-500', border: 'border-indigo-500/20' },
  SHOPHOUSE: { label: 'Shophouse', bg: 'bg-rose-500/10', color: 'text-rose-500', border: 'border-rose-500/20' },
};

export const RE_PRODUCT_STATUS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  AVAILABLE: { label: 'Trống', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  LOCKED: { label: 'Khóa/Giữ chỗ', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  RESERVED: { label: 'Đã đặt cọc', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  PENDING_DEPOSIT: { label: 'Chờ cọc', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  DEPOSIT: { label: 'Đã cọc', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  SOLD: { label: 'Đã bán', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
  COMPLETED: { label: 'Hoàn tất', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
};

// Keep backward-compatible alias
export const RE_INVENTORY_STATUS = RE_PRODUCT_STATUS;

export const RE_LEGAL_PROCEDURE_STATUS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PREPARATION: { label: 'Yêu cầu CĐT', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
  SUBMITTED: { label: 'Đang soạn thảo', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  ISSUE_FIXING: { label: 'Chờ CĐT duyệt', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  APPROVED: { label: 'Đã ban hành', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

export function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'U';
}
