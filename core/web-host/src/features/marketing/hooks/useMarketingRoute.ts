/**
 * useMarketingRoute — Hash-based routing for MarketingShell
 * Reads/writes URL hash to maintain active screen across refreshes.
 * Falls back to 'MKT_DASHBOARD' if no hash or invalid key.
 */
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

export function useMarketingRoute(validKeys: string[]) {
  const getKeyFromHash = (): string => {
    if (Platform.OS !== 'web') return 'MKT_DASHBOARD';
    const hash = window.location.hash.replace('#', '').toUpperCase();
    return validKeys.includes(hash) ? hash : 'MKT_DASHBOARD';
  };

  const [activeKey, setActiveKey] = useState(getKeyFromHash);

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
