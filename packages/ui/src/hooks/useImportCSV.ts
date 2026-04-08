/**
 * useImportCSV — CSV file import hook for React Native / Web
 * Usage:
 *   const { importCSV, importing, lastImportCount } = useImportCSV();
 *   const data = await importCSV(columns);
 */
import { useState, useCallback } from 'react';
import { Platform } from 'react-native';

type Column = { key: string; title: string; required?: boolean };

export function useImportCSV() {
  const [importing, setImporting] = useState(false);
  const [lastImportCount, setLastImportCount] = useState(0);

  const parseCSV = useCallback((text: string, columns: Column[]): Record<string, string>[] => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return []; // Need header + at least 1 data row

    const header = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

    // Map CSV headers to column keys
    const keyMap: Record<number, string> = {};
    header.forEach((h, i) => {
      const col = columns.find(c => c.title.toLowerCase() === h.toLowerCase() || c.key.toLowerCase() === h.toLowerCase());
      if (col) keyMap[i] = col.key;
    });

    const data: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const row: Record<string, string> = {};
      Object.entries(keyMap).forEach(([idx, key]) => {
        row[key] = values[Number(idx)] || '';
      });

      // Skip empty rows
      if (Object.values(row).some(v => v.length > 0)) {
        data.push(row);
      }
    }

    return data;
  }, []);

  const importCSV = useCallback(async (columns: Column[]): Promise<Record<string, string>[]> => {
    if (Platform.OS !== 'web') {
      console.warn('[useImportCSV] File picker only supported on web');
      return [];
    }

    return new Promise((resolve) => {
      setImporting(true);
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,.txt';

      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (!file) {
          setImporting(false);
          resolve([]);
          return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
          const text = ev.target?.result as string;
          const data = parseCSV(text, columns);
          setLastImportCount(data.length);
          setImporting(false);
          resolve(data);
        };
        reader.onerror = () => {
          setImporting(false);
          resolve([]);
        };
        reader.readAsText(file, 'UTF-8');
      };

      input.oncancel = () => {
        setImporting(false);
        resolve([]);
      };

      input.click();
    });
  }, [parseCSV]);

  return { importCSV, importing, lastImportCount };
}
