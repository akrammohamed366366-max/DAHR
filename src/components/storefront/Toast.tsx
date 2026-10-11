import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useI18n } from '../../i18n/context';
import { ToastMessage, ToastType } from '../../types';

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 end-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

export const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: () => void;
}> = ({ toast, onDismiss }) => {
  const typeConfig: Record<
    ToastType,
    { icon: React.ReactNode; border: string; iconColor: string }
  > = {
    success: {
      icon: <CheckCircle className="w-4 h-4" />,
      border: 'border-[#4B5D46]/40',
      iconColor: 'text-[#4B5D46]',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4" />,
      border: 'border-[#A9772F]/40',
      iconColor: 'text-[#A9772F]',
    },
    error: {
      icon: <AlertCircle className="w-4 h-4" />,
      border: 'border-[#8C3B2E]/40',
      iconColor: 'text-[#8C3B2E]',
    },
    info: {
      icon: <Info className="w-4 h-4" />,
      border: 'border-[#A98860]/40',
      iconColor: 'text-[#A98860]',
    },
  };

  const config = typeConfig[toast.type];
  const { locale } = useI18n();

  return (
    <div
      role="alert"
      className={`
        pointer-events-auto w-full bg-[#FAF7F2] border ${config.border} rounded-[2px]
        p-4 shadow-sm flex items-start justify-between gap-3 text-start
        font-body animate-in fade-in slide-in-from-bottom-2 duration-200
      `}
    >
      <div className="flex items-start gap-3">
        <span className={`shrink-0 mt-0.5 ${config.iconColor}`}>{config.icon}</span>
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] sm:text-[14px] font-medium text-[#1C1A17]">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-[12px] text-[#7A736A] leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label={locale === 'ar' ? 'إغلاق الإشعار' : 'Dismiss notification'}
        className="shrink-0 text-[#7A736A] hover:text-[#1C1A17] p-1 cursor-pointer transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
