import { useState, useCallback } from 'react';

/**
 * Toggle boolean state hook
 */
export function useToggle(initial = false): [boolean, () => void, (val: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}
