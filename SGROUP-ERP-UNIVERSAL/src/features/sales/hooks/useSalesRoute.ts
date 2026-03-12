/**
 * useSalesRoute — Hash-based routing for SalesShell
 * Reads/writes URL hash to maintain active screen across refreshes.
 * Falls back to 'SALES_DASHBOARD' if no hash or invalid key.
 */
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

export function useSalesRoute(validKeys: string[]) {
  const getKeyFromHash = (): string => {
    if (Platform.OS !== 'web') return 'SALES_DASHBOARD';
    const hash = window.location.hash.replace('#', '').toUpperCase();
    return validKeys.includes(hash) ? hash : 'SALES_DASHBOARD';
  };

  const [activeKey, setActiveKey] = useState(getKeyFromHash);

  // Listen for popstate (browser back/forward)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = () => setActiveKey(getKeyFromHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((key: string) => {
    setActiveKey(key);
    if (Platform.OS === 'web') {
      window.location.hash = key.toLowerCase();
    }
  }, []);

  return { activeKey, navigate };
}
