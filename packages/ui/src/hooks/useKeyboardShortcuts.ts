/**
 * useKeyboardShortcuts — Register keyboard shortcuts for power users
 * Usage:
 *   useKeyboardShortcuts({
 *     'ctrl+k': () => openSearch(),
 *     'escape': () => closeModal(),
 *     'ctrl+n': () => createNew(),
 *   });
 */
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

type ShortcutMap = Record<string, () => void>;

function normalizeKey(e: KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey || e.metaKey) parts.push('ctrl');
  if (e.altKey) parts.push('alt');
  if (e.shiftKey) parts.push('shift');
  parts.push(e.key.toLowerCase());
  return parts.join('+');
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Only allow Escape in inputs
        if (e.key !== 'Escape') return;
      }

      const key = normalizeKey(e);
      const action = shortcutsRef.current[key];
      if (action) {
        e.preventDefault();
        e.stopPropagation();
        action();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}

/**
 * Pre-defined shortcut presets for common operations
 */
export const SHORTCUT_PRESETS = {
  SEARCH: 'ctrl+k',
  NEW: 'ctrl+n',
  SAVE: 'ctrl+s',
  CLOSE: 'escape',
  REFRESH: 'ctrl+r',
  EXPORT: 'ctrl+e',
  DELETE: 'ctrl+delete',
  SELECT_ALL: 'ctrl+a',
} as const;
