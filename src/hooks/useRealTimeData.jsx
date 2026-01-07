import { useState, useEffect, useCallback, createContext, useContext } from 'react';

// Real-time data context for global state management
const RealTimeDataContext = createContext(null);

// Custom hook for real-time data fetching with optimistic updates
export function useRealTimeData(fetchFunction, options = {}) {
  const {
    interval = 30000, // 30 seconds default
    enabled = true,
    onSuccess = null,
    onError = null,
    initialData = null
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!enabled) return;
    
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else if (!data) {
        setLoading(true);
      }
      
      const result = await fetchFunction();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
      onSuccess?.(result);
    } catch (err) {
      console.error('Real-time data fetch error:', err);
      setError(err.message || 'Failed to fetch data');
      onError?.(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchFunction, enabled, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Set up polling interval
  useEffect(() => {
    if (!enabled || !interval) return;

    const intervalId = setInterval(() => {
      fetchData(true);
    }, interval);

    return () => clearInterval(intervalId);
  }, [fetchData, interval, enabled]);

  // Optimistic update function
  const optimisticUpdate = useCallback((updateFn) => {
    setData(prevData => {
      const newData = typeof updateFn === 'function' ? updateFn(prevData) : updateFn;
      return newData;
    });
  }, []);

  // Manual refresh
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    isRefreshing,
    refresh,
    optimisticUpdate,
    setData
  };
}

// Hook for handling API calls with optimistic updates
export function useOptimisticMutation(mutationFn, options = {}) {
  const {
    onSuccess = null,
    onError = null,
    onMutate = null,
    invalidateQueries = []
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = async (variables, { optimisticData, rollbackData } = {}) => {
    setLoading(true);
    setError(null);

    // Call onMutate for optimistic update
    const context = onMutate?.(variables, optimisticData);

    try {
      const result = await mutationFn(variables);
      onSuccess?.(result, variables);
      return result;
    } catch (err) {
      // Rollback on error
      if (rollbackData) {
        context?.rollback?.(rollbackData);
      }
      setError(err.message || 'Mutation failed');
      onError?.(err, variables, context);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

// Animation utilities
export const animations = {
  fadeIn: 'animate-fade-in',
  fadeInUp: 'animate-fade-in-up',
  fadeInDown: 'animate-fade-in-down',
  fadeInLeft: 'animate-fade-in-left',
  fadeInRight: 'animate-fade-in-right',
  scaleIn: 'animate-scale-in',
  slideInRight: 'animate-slide-in-right',
  slideInLeft: 'animate-slide-in-left',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  ping: 'animate-ping'
};

// Stagger animation helper
export function useStaggerAnimation(itemCount, baseDelay = 50) {
  return Array.from({ length: itemCount }, (_, i) => ({
    style: { animationDelay: `${i * baseDelay}ms` },
    className: 'animate-fade-in-up opacity-0'
  }));
}

// Intersection observer hook for scroll animations
export function useScrollAnimation(options = {}) {
  const [ref, setRef] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, options]);

  return [setRef, isVisible];
}

// Number animation hook
export function useCountAnimation(targetValue, duration = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (targetValue === 0) {
      setCount(0);
      return;
    }

    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * targetValue));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, duration]);

  return count;
}

// Progress bar animation hook
export function useProgressAnimation(targetProgress, duration = 500) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      setProgress(eased * targetProgress);

      if (progressRatio < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetProgress, duration]);

  return progress;
}

// Toast notification system
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now();
    const newToast = { id, ...toast };
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message, options = {}) => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ type: 'error', message, ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  const xp = useCallback((amount, message, options = {}) => {
    return addToast({ type: 'xp', amount, message, ...options });
  }, [addToast]);

  return { toasts, addToast, removeToast, success, error, info, xp };
}

// Format relative time
export function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

// Format numbers with abbreviations
export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Debounce hook
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Local storage hook with sync
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

// API helper with auth
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized - could trigger logout
      throw new Error('Unauthorized');
    }
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
}

// Export context provider
export function RealTimeDataProvider({ children }) {
  const [globalRefreshTrigger, setGlobalRefreshTrigger] = useState(0);

  const triggerGlobalRefresh = useCallback(() => {
    setGlobalRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <RealTimeDataContext.Provider value={{ globalRefreshTrigger, triggerGlobalRefresh }}>
      {children}
    </RealTimeDataContext.Provider>
  );
}

export function useGlobalRefresh() {
  return useContext(RealTimeDataContext);
}
