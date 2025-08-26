import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from 'react';

interface ToastContextType {
  showError: (message: string, onRetry?: () => void) => void;
  hideToast: () => void;
  toast: {
    visible: boolean;
    message: string;
    onRetry?: () => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    onRetry?: () => void;
  }>({
    visible: false,
    message: '',
    onRetry: undefined,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast.visible) {
      timeoutRef.current = setTimeout(() => {
        setToast(prev => ({
          ...prev,
          visible: false,
        }));
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [toast.visible]);

  const showError = useCallback((message: string, onRetry?: () => void) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({
      visible: true,
      message,
      onRetry,
    });
  }, []);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const value: ToastContextType = {
    showError,
    hideToast,
    toast,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
