import { useState, useEffect, useCallback } from 'react';

export function useHRRoute(validKeys: string[]) {
  const parseHash = () => {
    if (typeof window === 'undefined') return { key: 'HR_DASHBOARD', params: new URLSearchParams() };
    const fullHash = window.location.hash.replace('#', '');
    const [path, queryString] = fullHash.split('?');
    const key = path.toUpperCase();
    
    return {
      key: validKeys.includes(key) ? key : 'HR_DASHBOARD',
      params: new URLSearchParams(queryString || '')
    };
  };

  const [routeState, setRouteState] = useState(parseHash());

  useEffect(() => {
    const handler = () => setRouteState(parseHash());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((key: string, params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params || {});
    const queryString = searchParams.toString();
    const newHash = `${key.toLowerCase()}${queryString ? `?${queryString}` : ''}`;
    
    setRouteState({
      key: validKeys.includes(key.toUpperCase()) ? key.toUpperCase() : 'HR_DASHBOARD',
      params: searchParams
    });
    window.location.hash = newHash;
  }, [validKeys]);

  return { activeKey: routeState.key, params: routeState.params, navigate };
}
