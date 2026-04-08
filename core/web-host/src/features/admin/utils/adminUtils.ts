/**
 * Admin Module — Shared Utilities
 */
import { Platform, Alert } from 'react-native';

/**
 * Cross-platform toast/alert helper — uses custom toast on web, Alert.alert on native
 * On web: creates a beautiful floating notification instead of window.alert
 */
export function showToast(msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  if (Platform.OS === 'web') {
    createWebToast(msg, type);
  } else {
    const title = type === 'success' ? '✅ Thành công'
      : type === 'error' ? '❌ Lỗi'
      : type === 'warning' ? '⚠️ Cảnh báo'
      : 'ℹ️ Thông báo';
    Alert.alert(title, msg);
  }
}

/** Legacy alert — use showToast instead */
export function showAlert(msg: string, title = 'Thông báo') {
  if (Platform.OS === 'web') {
    const type = title.toLowerCase().includes('lỗi') ? 'error'
      : title.toLowerCase().includes('thành công') ? 'success'
      : 'info';
    createWebToast(msg, type);
  } else {
    Alert.alert(title, msg);
  }
}

/** Create a beautiful web toast notification */
function createWebToast(msg: string, type: 'success' | 'error' | 'warning' | 'info') {
  if (typeof document === 'undefined') return;

  // Ensure container exists
  let container = document.getElementById('sg-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'sg-toast-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '99999',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none',
    });
    document.body.appendChild(container);
  }

  const colors = {
    success: { bg: 'rgba(16,185,129,0.95)', border: '#10b981', icon: '✅' },
    error:   { bg: 'rgba(239,68,68,0.95)', border: '#ef4444', icon: '❌' },
    warning: { bg: 'rgba(245,158,11,0.95)', border: '#f59e0b', icon: '⚠️' },
    info:    { bg: 'rgba(99,102,241,0.95)', border: '#6366f1', icon: 'ℹ️' },
  };
  const c = colors[type];

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${c.bg};
    border-left: 4px solid ${c.border};
    color: #fff;
    padding: 14px 20px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
    font-size: 14px;
    font-weight: 600;
    min-width: 280px;
    max-width: 420px;
    pointer-events: auto;
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    backdrop-filter: blur(20px);
    transform: translateX(120%);
    transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
    opacity: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  `;
  toast.innerHTML = `<span style="font-size:16px">${c.icon}</span><span>${msg}</span>`;
  toast.onclick = () => removeToast(toast);

  container.appendChild(toast);

  // Slide in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  });

  // Auto dismiss after 4s
  const timer = setTimeout(() => removeToast(toast), 4000);
  (toast as any).__timer = timer;

  function removeToast(el: HTMLElement) {
    clearTimeout((el as any).__timer);
    el.style.transform = 'translateX(120%)';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 350);
  }
}

/**
 * Relative date formatter for Vietnamese locale
 */
export function formatRelativeDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return d.toLocaleDateString('vi', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Download text content as file (web only)
 */
export function downloadFile(content: string, filename: string, mimeType = 'text/csv') {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
