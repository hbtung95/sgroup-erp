/**
 * usePDFExport — Generate and download PDF reports on web
 * Uses browser print API for zero-dependency PDF generation.
 * Usage:
 *   const { exportToPDF } = usePDFExport();
 *   exportToPDF({ title: 'Báo Cáo Hoa Hồng', columns, data, footer: 'SGROUP ERP' });
 */
import { useCallback } from 'react';
import { Platform } from 'react-native';

type Column = { key: string; title: string; width?: string };

type PDFOptions = {
  title: string;
  subtitle?: string;
  columns: Column[];
  data: Record<string, any>[];
  footer?: string;
  orientation?: 'portrait' | 'landscape';
};

export function usePDFExport() {
  const exportToPDF = useCallback((options: PDFOptions) => {
    if (Platform.OS !== 'web') {
      console.warn('[usePDFExport] Only supported on web');
      return;
    }

    const { title, subtitle, columns, data, footer = 'SGROUP ERP', orientation = 'portrait' } = options;

    const headerRow = columns.map(c =>
      `<th style="padding:10px 12px;text-align:left;font-weight:800;font-size:11px;color:#1e293b;background:#f1f5f9;border-bottom:2px solid #e2e8f0;">${c.title}</th>`
    ).join('');

    const dataRows = data.map((row, i) =>
      `<tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">` +
      columns.map(c =>
        `<td style="padding:8px 12px;font-size:11px;color:#334155;border-bottom:1px solid #f1f5f9;">${row[c.key] ?? ''}</td>`
      ).join('') +
      '</tr>'
    ).join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page { size: ${orientation}; margin: 20mm; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #1e293b; margin: 0; padding: 20px; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 3px solid #3b82f6; padding-bottom: 16px; }
    .header h1 { font-size: 22px; font-weight: 900; color: #0f172a; margin: 0; }
    .header p { font-size: 12px; color: #64748b; margin: 4px 0 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    .footer { text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; }
    .meta { font-size: 10px; color: #94a3b8; text-align: right; margin-bottom: 8px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    ${subtitle ? `<p>${subtitle}</p>` : ''}
  </div>
  <div class="meta">Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} | Tổng: ${data.length} dòng</div>
  <table>
    <thead><tr>${headerRow}</tr></thead>
    <tbody>${dataRows}</tbody>
  </table>
  <div class="footer">${footer} — Hệ Thống Quản Lý Kinh Doanh</div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  }, []);

  return { exportToPDF };
}
