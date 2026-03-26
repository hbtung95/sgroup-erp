import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';

export function useProjectRoute(validKeys: string[]) {
  const getKeyFromHash = (): string => {
    if (Platform.OS !== 'web') return 'PROJECT_DASHBOARD';
    const hash = window.location.hash.replace('#', '').toUpperCase();
    return validKeys.includes(hash) ? hash : 'PROJECT_DASHBOARD';
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
