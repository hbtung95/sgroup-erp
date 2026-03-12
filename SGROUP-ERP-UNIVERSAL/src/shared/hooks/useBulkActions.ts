/**
 * useBulkActions — Hook for multi-select operations on lists
 * Usage:
 *   const { selectedIds, toggleSelect, selectAll, clearSelection, isSelected, count } = useBulkActions();
 */
import { useState, useCallback, useMemo } from 'react';

export function useBulkActions<T extends string = string>() {
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());

  const toggleSelect = useCallback((id: T) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: T[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback((id: T) => selectedIds.has(id), [selectedIds]);

  const count = useMemo(() => selectedIds.size, [selectedIds]);

  const selectedArray = useMemo(() => Array.from(selectedIds), [selectedIds]);

  return {
    selectedIds: selectedArray,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    count,
    hasSelection: count > 0,
  };
}
