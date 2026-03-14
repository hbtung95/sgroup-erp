import React, { createContext, useCallback, useContext, type ReactNode } from 'react';
import {
  SGToastProvider,
  useToast as useSharedToast,
} from '../../../shared/ui/components/SGToast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

function ToastProviderBridge({ children }: { children: ReactNode }) {
  const { toast } = useSharedToast();

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const titleByType: Record<ToastType, string> = {
        success: 'Thanh cong',
        error: 'Co loi xay ra',
        warning: 'Can kiem tra',
        info: 'Thong tin',
      };

      toast({
        type,
        title: titleByType[type],
        message,
      });
    },
    [toast],
  );

  return <ToastContext.Provider value={{ showToast }}>{children}</ToastContext.Provider>;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <SGToastProvider>
      <ToastProviderBridge>{children}</ToastProviderBridge>
    </SGToastProvider>
  );
}
