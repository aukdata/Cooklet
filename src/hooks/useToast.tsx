import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import ToastContainer from '../components/ui/ToastContainer';
import type { ToastMessage } from '../components/ui/ToastContainer';

interface ToastContextType {
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'error' | 'info', message: string): void => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, message };
    
    setToasts((prev) => [...prev, newToast]);
  };

  const showSuccess = (message: string): void => {
    showToast('success', message);
  };

  const showError = (message: string): void => {
    showToast('error', message);
  };

  const showInfo = (message: string): void => {
    showToast('info', message);
  };

  const removeToast = (id: string): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showInfo,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};