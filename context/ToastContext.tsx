import { Toast, ToastType } from '@/components/ui/Toast';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: { hideInRoot?: boolean }) => void;
  hideToast: () => void;
  visible: boolean;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('info');
  const [hideInRoot, setHideInRoot] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);

  const showToast = useCallback((msg: string, toastType: ToastType = 'info', options?: { hideInRoot?: boolean }) => {
    if (timer) clearTimeout(timer);
    
    setMessage(msg);
    setType(toastType);
    setHideInRoot(options?.hideInRoot ?? false);
    setVisible(true);

    const newTimer = setTimeout(() => {
      setVisible(false);
      setHideInRoot(false);
    }, 3000); // Auto dismiss after 3 seconds
    
    setTimer(newTimer);
  }, [timer]);

  const hideToast = useCallback(() => {
    if (timer) clearTimeout(timer);
    setVisible(false);
    setHideInRoot(false);
  }, [timer]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, visible, message, type }}>
      {children}
      {!hideInRoot && (
        <Toast 
          message={message} 
          type={type} 
          visible={visible} 
          onDismiss={hideToast} 
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
