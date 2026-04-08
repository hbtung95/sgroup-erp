import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

export function useLegalRoute(validKeys: string[]) {
  const getKeyFromHash = (): string => {
    if (Platform.OS !== 'web') return 'LEGAL_DASHBOARD';
    const hash = window.location.hash.replace('#', '').toUpperCase();
    return validKeys.includes(hash) ? hash : 'LEGAL_DASHBOARD';
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
