/**
 * useSessionTimeout — Auto-logout after N minutes of inactivity
 * Usage:
 *   useSessionTimeout(30); // 30 minutes
 */
import { useEffect, useRef, useCallback } from 'react';
import { Platform, AppState } from 'react-native';

type Options = {
  timeoutMinutes?: number;
  onTimeout: () => void;
  warningMinutes?: number;
  onWarning?: () => void;
};

export function useSessionTimeout({
  timeoutMinutes = 30,
  onTimeout,
  warningMinutes = 2,
  onWarning,
}: Options) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef(Date.now());

  const resetTimers = useCallback(() => {
    lastActivityRef.current = Date.now();

    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    // Warning timer
    if (onWarning && warningMinutes > 0) {
      const warningMs = (timeoutMinutes - warningMinutes) * 60 * 1000;
      if (warningMs > 0) {
        warningTimerRef.current = setTimeout(() => {
          onWarning();
        }, warningMs);
      }
    }

    // Timeout timer
    timerRef.current = setTimeout(() => {
      onTimeout();
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes, warningMinutes, onTimeout, onWarning]);

  useEffect(() => {
    resetTimers();

    if (Platform.OS === 'web') {
      const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
      const handler = () => resetTimers();
      events.forEach(event => document.addEventListener(event, handler, { passive: true }));
      return () => {
        events.forEach(event => document.removeEventListener(event, handler));
        if (timerRef.current) clearTimeout(timerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      };
    } else {
      // React Native — listen to AppState
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          const elapsed = Date.now() - lastActivityRef.current;
          if (elapsed > timeoutMinutes * 60 * 1000) {
            onTimeout();
          } else {
            resetTimers();
          }
        }
      });
      return () => {
        sub.remove();
        if (timerRef.current) clearTimeout(timerRef.current);
        if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      };
    }
  }, [resetTimers, timeoutMinutes, onTimeout]);

  return { resetTimers };
}
