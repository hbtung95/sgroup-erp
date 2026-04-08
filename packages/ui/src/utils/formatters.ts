/**
 * Number formatting utilities for Vietnamese locale
 */

/**
 * Format number with Vietnamese locale (dots as thousand separators)
 */
export function formatNumber(n: number, decimals = 0): string {
  return n.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format as currency in billions (Tỷ)
 */
export function formatTy(n: number, decimals = 2): string {
  return `${formatNumber(n, decimals)} Tỷ`;
}

/**
 * Format as currency in millions (Triệu)
 */
export function formatTrieu(n: number, decimals = 0): string {
  return `${formatNumber(n, decimals)} Tr`;
}

/**
 * Format percentage
 */
export function formatPercent(n: number, decimals = 1): string {
  return `${formatNumber(n, decimals)}%`;
}

/**
 * Compact number (e.g., 1.2K, 3.5M, 2.1B)
 */
export function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Format date to Vietnamese locale string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format date + time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g. "5 phút trước", "2 giờ trước")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return formatDate(d);
}
