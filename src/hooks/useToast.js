import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, duration) => {
    return addToast(message, 'success', duration);
  };

  const error = (message, duration) => {
    return addToast(message, 'error', duration);
  };

  const info = (message, duration) => {
    return addToast(message, 'info', duration);
  };

  const warning = (message, duration) => {
    return addToast(message, 'warning', duration);
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  };
}

export function ToastContainer({ toasts, removeToast }) {
  const getStyles = (type) => {
    const baseStyles = 'flex items-center gap-3 p-4 rounded-lg shadow-lg text-white animate-in fade-in slide-in-from-right-4 duration-300';

    const typeStyles = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    return `${baseStyles} ${typeStyles[type] || typeStyles.info}`;
  };

  const getIcon = (type) => {
    if (type === 'success' || type === 'error') {
      const Icon = type === 'success' ? CheckCircle : AlertCircle;
      return <Icon size={20} className="flex-shrink-0" />;
    }
    return null;
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 pointer-events-auto z-50">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={getStyles(toast.type)}
          role="alert"
        >
          {getIcon(toast.type)}
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white hover:opacity-80"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

export default useToast;
