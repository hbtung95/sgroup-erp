/**
 * useExportReport — Export data to CSV/Excel for download (web)
 * Usage:
 *   const { exportToCSV } = useExportReport();
 *   exportToCSV(data, columns, 'commission-report');
 */
import { useCallback } from 'react';
import { Platform } from 'react-native';

type Column = { key: string; title: string };

export function useExportReport() {
  const exportToCSV = useCallback((data: Record<string, any>[], columns: Column[], filename = 'report') => {
    if (Platform.OS !== 'web') {
      console.warn('[useExportReport] CSV export is only supported on web');
      return;
    }

    // Header row
    const header = columns.map(c => c.title).join(',');

    // Data rows — escape commas and quotes
    const rows = data.map(row =>
      columns.map(c => {
        const val = String(row[c.key] ?? '');
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    );

    const csvContent = '\uFEFF' + [header, ...rows].join('\n'); // BOM for UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const exportToJSON = useCallback((data: Record<string, any>[], filename = 'report') => {
    if (Platform.OS !== 'web') return;

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return { exportToCSV, exportToJSON };
}
