import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Award, Trophy, Star, Zap, CheckCircle, Flame, X, Sparkles } from 'lucide-react';

// Context for managing notifications globally
const NotificationContext = createContext();

export const useGamificationNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useGamificationNotification must be used within a GamificationNotificationProvider');
  }
  return context;
};

// Notification types with their styling
const notificationStyles = {
  xp: {
    bgGradient: 'from-yellow-400 to-orange-500',
    icon: Star,
    iconBg: 'bg-yellow-500',
    textColor: 'text-white'
  },
  levelUp: {
    bgGradient: 'from-purple-500 to-violet-600',
    icon: Zap,
    iconBg: 'bg-purple-600',
    textColor: 'text-white'
  },
  achievement: {
    bgGradient: 'from-green-500 to-emerald-600',
    icon: Trophy,
    iconBg: 'bg-green-600',
    textColor: 'text-white'
  },
  streak: {
    bgGradient: 'from-orange-500 to-red-500',
    icon: Flame,
    iconBg: 'bg-orange-600',
    textColor: 'text-white'
  },
  badge: {
    bgGradient: 'from-blue-500 to-indigo-600',
    icon: Award,
    iconBg: 'bg-blue-600',
    textColor: 'text-white'
  },
  success: {
    bgGradient: 'from-emerald-500 to-teal-600',
    icon: CheckCircle,
    iconBg: 'bg-emerald-600',
    textColor: 'text-white'
  }
};

// Single notification component
const NotificationToast = ({ notification, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const style = notificationStyles[notification.type] || notificationStyles.success;
  const Icon = style.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onDismiss(notification.id), 300);
    }, notification.duration || 4000);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 ${
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <div
        className={`relative bg-gradient-to-r ${style.bgGradient} ${style.textColor} rounded-xl shadow-2xl overflow-hidden min-w-80 max-w-md`}
      >
        {/* Sparkle animation overlay */}
        {notification.type === 'levelUp' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Sparkles className="absolute top-2 right-8 w-4 h-4 text-white/50 animate-pulse" />
            <Sparkles className="absolute bottom-2 left-8 w-3 h-3 text-white/50 animate-pulse delay-100" />
            <Sparkles className="absolute top-1/2 right-4 w-3 h-3 text-white/50 animate-pulse delay-200" />
          </div>
        )}

        <div className="p-4 flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 ${style.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg">{notification.title}</h4>
            <p className="text-sm opacity-90">{notification.message}</p>
            
            {/* Extra value display (e.g., XP amount) */}
            {notification.value && (
              <div className="mt-2 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                {notification.type === 'xp' && '+'}
                {notification.value}
                {notification.type === 'xp' && ' XP'}
                {notification.type === 'streak' && ' Day Streak'}
                {notification.type === 'levelUp' && ` - ${notification.rank || 'Level Up!'}`}
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-white/50 transition-all ease-linear"
            style={{
              width: '100%',
              animation: `shrink ${notification.duration || 4000}ms linear forwards`
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Notification container component
const NotificationContainer = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

// Provider component
export const GamificationNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  let notificationId = 0;

  const showNotification = useCallback((notification) => {
    const id = Date.now() + (++notificationId);
    setNotifications((prev) => [...prev, { ...notification, id }]);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Convenience methods
  const showXpGained = useCallback((amount, message = 'Keep up the great work!') => {
    showNotification({
      type: 'xp',
      title: 'XP Earned!',
      message,
      value: amount,
      duration: 3000
    });
  }, [showNotification]);

  const showLevelUp = useCallback((level, rank) => {
    showNotification({
      type: 'levelUp',
      title: 'Level Up!',
      message: `You've reached Level ${level}!`,
      value: level,
      rank,
      duration: 5000
    });
  }, [showNotification]);

  const showAchievementUnlocked = useCallback((title, description) => {
    showNotification({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `${title}: ${description}`,
      duration: 5000
    });
  }, [showNotification]);

  const showStreakUpdate = useCallback((days) => {
    showNotification({
      type: 'streak',
      title: 'Streak Updated!',
      message: days >= 7 ? 'Amazing consistency!' : 'Keep the momentum going!',
      value: days,
      duration: 4000
    });
  }, [showNotification]);

  const showBadgeEarned = useCallback((badgeName, description) => {
    showNotification({
      type: 'badge',
      title: 'New Badge Earned!',
      message: `${badgeName}: ${description}`,
      duration: 5000
    });
  }, [showNotification]);

  const value = {
    showNotification,
    showXpGained,
    showLevelUp,
    showAchievementUnlocked,
    showStreakUpdate,
    showBadgeEarned
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </NotificationContext.Provider>
  );
};

export default GamificationNotificationProvider;
