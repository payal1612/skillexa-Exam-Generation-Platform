import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Zap, 
  X, 
  Trophy, 
  Star,
  Flame,
  Award
} from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast types and their configurations
const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50',
    border: 'border-green-200',
    iconColor: 'text-green-500',
    textColor: 'text-green-800',
    progressColor: 'bg-green-500'
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-800',
    progressColor: 'bg-red-500'
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    textColor: 'text-yellow-800',
    progressColor: 'bg-yellow-500'
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800',
    progressColor: 'bg-blue-500'
  },
  xp: {
    icon: Zap,
    bg: 'bg-gradient-to-r from-violet-500 to-purple-600',
    border: 'border-violet-300',
    iconColor: 'text-yellow-300',
    textColor: 'text-white',
    progressColor: 'bg-white/30'
  },
  levelUp: {
    icon: Star,
    bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    border: 'border-yellow-300',
    iconColor: 'text-white',
    textColor: 'text-white',
    progressColor: 'bg-white/30'
  },
  achievement: {
    icon: Trophy,
    bg: 'bg-gradient-to-r from-amber-500 to-yellow-500',
    border: 'border-amber-300',
    iconColor: 'text-white',
    textColor: 'text-white',
    progressColor: 'bg-white/30'
  },
  streak: {
    icon: Flame,
    bg: 'bg-gradient-to-r from-orange-500 to-red-500',
    border: 'border-orange-300',
    iconColor: 'text-white',
    textColor: 'text-white',
    progressColor: 'bg-white/30'
  }
};

// Individual Toast Component
function Toast({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const Icon = config.icon;
  const duration = toast.duration || 5000;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-xl shadow-lg border ${config.bg} ${config.border} ${
        isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
      } max-w-sm w-full`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${config.iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className={`font-semibold ${config.textColor}`}>
                {toast.title}
              </h4>
            )}
            <p className={`text-sm ${config.textColor} ${toast.title ? 'opacity-90' : ''}`}>
              {toast.message}
            </p>
            {toast.amount && (
              <p className={`text-lg font-bold mt-1 ${config.textColor}`}>
                +{toast.amount} XP
              </p>
            )}
          </div>
          <button 
            onClick={handleClose}
            className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors ${config.textColor}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-black/10">
        <div 
          className={`h-full ${config.progressColor} transition-all duration-100`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, ...toast }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    xp: (amount, message = 'XP Earned!', options = {}) => addToast({ 
      type: 'xp', 
      title: message, 
      message: `You earned ${amount} experience points!`,
      amount,
      duration: 4000,
      ...options 
    }),
    levelUp: (level, options = {}) => addToast({ 
      type: 'levelUp', 
      title: '🎉 Level Up!', 
      message: `Congratulations! You've reached Level ${level}!`,
      duration: 6000,
      ...options 
    }),
    achievement: (name, description, options = {}) => addToast({ 
      type: 'achievement', 
      title: `🏆 ${name}`, 
      message: description,
      duration: 6000,
      ...options 
    }),
    streak: (days, options = {}) => addToast({ 
      type: 'streak', 
      title: '🔥 Streak Bonus!', 
      message: `${days} day streak! Keep it up!`,
      duration: 5000,
      ...options 
    }),
    custom: (toast) => addToast(toast)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Animation styles */}
      <style>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-out-right {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
        
        .animate-slide-out-right {
          animation: slide-out-right 0.3s ease-in forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
