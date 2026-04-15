export const FILTER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'ACTIVE', label: 'Đang làm' },
  { key: 'PROBATION', label: 'Thử việc' },
  { key: 'ON_LEAVE', label: 'Đang nghỉ' },
  { key: 'TERMINATED', label: 'Đã nghỉ' },
];

export const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Đang làm', color: 'text-emerald-500', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20' },
  { value: 'PROBATION', label: 'Thử việc', color: 'text-blue-500', bg: 'bg-blue-500/15', border: 'border-blue-500/20' },
  { value: 'ON_LEAVE', label: 'Đang nghỉ', color: 'text-amber-500', bg: 'bg-amber-500/15', border: 'border-amber-500/20' },
  { value: 'TERMINATED', label: 'Đã nghỉ', color: 'text-red-500', bg: 'bg-red-500/15', border: 'border-red-500/20' },
]; 

export const WORK_STATUS_OPTIONS = [
  { v: 'Đang làm việc', l: 'Đang làm việc' },
  { v: 'Thử việc', l: 'Thử việc' },
  { v: 'Đang nghỉ phép', l: 'Đang nghỉ phép' },
  { v: 'Đã nghỉ việc', l: 'Đã nghỉ việc' },
];

export const CANDIDATE_SOURCE_OPTIONS = [
  { v: 'LinkedIn', l: 'LinkedIn' },
  { v: 'TopCV', l: 'TopCV' },
  { v: 'VietnamWorks', l: 'VietnamWorks' },
  { v: 'Website công ty', l: 'Website công ty' },
  { v: 'Giới thiệu nội bộ', l: 'Giới thiệu nội bộ' },
  { v: 'Facebook', l: 'Facebook' },
  { v: 'Headhunter', l: 'Headhunter' },
  { v: 'Job Fair', l: 'Job Fair' },
  { v: 'Khác', l: 'Khác' },
];

export const EMPLOYMENT_TYPE_OPTIONS = [
  { v: 'Toàn thời gian', l: 'Toàn thời gian' },
  { v: 'Bán thời gian', l: 'Bán thời gian' },
  { v: 'Thực tập', l: 'Thực tập' },
  { v: 'Hợp đồng', l: 'Hợp đồng' },
  { v: 'Freelance', l: 'Freelance' },
];

export function getInitials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || 'U';
}

export function nameToColorClass(name?: string) {
  const colors = [
    { text: 'text-pink-500', bg: 'bg-pink-500/15', border: 'border-pink-500/30' },
    { text: 'text-purple-500', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
    { text: 'text-blue-500', bg: 'bg-blue-500/15', border: 'border-blue-500/30' },
    { text: 'text-amber-500', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
    { text: 'text-emerald-500', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30' },
    { text: 'text-cyan-500', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30' },
    { text: 'text-indigo-500', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30' },
    { text: 'text-rose-500', bg: 'bg-rose-500/15', border: 'border-rose-500/30' },
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export const EMPTY_FORM = {
  fullName: '',
  englishName: '',
  email: '',
  phone: '',
  departmentId: '',
  positionId: '',
  teamId: '',
  status: 'ACTIVE' as const,
};

// ═══════════════════════════════════════════
// CENTRALIZED STATUS MAPPINGS
// Single source of truth for status enum ↔ display text
// ═══════════════════════════════════════════

/** Maps status enum to Vietnamese display text */
export const STATUS_ENUM_TO_DISPLAY: Record<string, string> = {
  ACTIVE: 'Đang làm việc',
  PROBATION: 'Thử việc',
  ON_LEAVE: 'Đang nghỉ phép',
  TERMINATED: 'Đã nghỉ việc',
};

/** Maps Vietnamese display text back to status enum */
export const STATUS_DISPLAY_TO_ENUM: Record<string, string> = {
  'Đang làm việc': 'ACTIVE',
  'Thử việc': 'PROBATION',
  'Đang nghỉ phép': 'ON_LEAVE',
  'Đã nghỉ việc': 'TERMINATED',
};

/** Get status display config (label, colors) for any status value */
export function getStatusConfig(status?: string) {
  const normalized = status?.toUpperCase() || '';
  // Try to match both enum values and Vietnamese display text
  const enumKey = STATUS_DISPLAY_TO_ENUM[status || ''] || normalized;

  switch (enumKey) {
    case 'ACTIVE':
      return { label: 'Đang làm việc', color: 'text-emerald-500', bg: 'bg-emerald-500/15', border: 'border-emerald-500/20', enum: 'ACTIVE' };
    case 'PROBATION':
      return { label: 'Thử việc', color: 'text-blue-500', bg: 'bg-blue-500/15', border: 'border-blue-500/20', enum: 'PROBATION' };
    case 'ON_LEAVE':
      return { label: 'Đang nghỉ phép', color: 'text-amber-500', bg: 'bg-amber-500/15', border: 'border-amber-500/20', enum: 'ON_LEAVE' };
    case 'TERMINATED':
      return { label: 'Đã nghỉ việc', color: 'text-red-500', bg: 'bg-red-500/15', border: 'border-red-500/20', enum: 'TERMINATED' };
    default:
      return { label: status || 'N/A', color: 'text-sg-muted', bg: 'bg-sg-btn-bg', border: 'border-sg-border', enum: status || '' };
  }
}

/** Leave type enum → display labels */
export const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: 'Nghỉ phép năm',
  SICK: 'Nghỉ ốm',
  UNPAID: 'Nghỉ không lương',
  MATERNITY: 'Nghỉ thai sản',
  BEREAVEMENT: 'Nghỉ tang',
  WEDDING: 'Nghỉ cưới',
  OTHER: 'Khác',
};

/** Attendance status config */
export const ATTENDANCE_STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  ON_TIME: { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-600 dark:text-green-400', label: 'Đúng giờ' },
  LATE: { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', label: 'Đi trễ' },
  ABSENT: { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-600 dark:text-red-400', label: 'Vắng mặt' },
  PRESENT: { bg: 'bg-green-100 dark:bg-green-500/15', text: 'text-green-600 dark:text-green-400', label: 'Có mặt' },
  HALF_DAY: { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', label: 'Nửa ngày' },
};

/** Payroll status config */
export const PAYROLL_STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PAID: { bg: 'bg-emerald-500/15', text: 'text-emerald-500', label: 'ĐÃ CHI' },
  APPROVED: { bg: 'bg-blue-500/15', text: 'text-blue-500', label: 'ĐÃ DUYỆT' },
  PENDING: { bg: 'bg-amber-500/15', text: 'text-amber-500', label: 'CHỜ DUYỆT' },
};

/** Leave request status config */
export const LEAVE_STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', label: 'ĐÃ DUYỆT' },
  PENDING: { bg: 'bg-amber-100 dark:bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400', label: 'CHỜ DUYỆT' },
  REJECTED: { bg: 'bg-red-100 dark:bg-red-500/15', text: 'text-red-600 dark:text-red-400', label: 'TỪ CHỐI' },
};

