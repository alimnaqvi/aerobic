import { Toast, ToastType } from '@/components/ui/Toast';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
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
  const [timer, setTimer] = useState<number | null>(null);

  const showToast = useCallback((msg: string, toastType: ToastType = 'info') => {
    if (timer) clearTimeout(timer);
    
    setMessage(msg);
    setType(toastType);
    setVisible(true);

    const newTimer = setTimeout(() => {
      setVisible(false);
    }, 3000); // Auto dismiss after 3 seconds
    
    setTimer(newTimer);
  }, [timer]);

  const hideToast = useCallback(() => {
    if (timer) clearTimeout(timer);
    setVisible(false);
  }, [timer]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, visible, message, type }}>
      {children}
      <Toast 
        message={message} 
        type={type} 
        visible={visible} 
        onDismiss={hideToast} 
      />
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
