import { AlertCircle, RefreshCw, WifiOff, ServerCrash, FileQuestion } from 'lucide-react';

// Loading skeleton components
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-16 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="animate-pulse flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center gap-3 p-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex justify-between mb-2">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-3 bg-gray-200 rounded w-1/6" />
      </div>
      <div className="h-2 bg-gray-200 rounded-full" />
    </div>
  );
}

// Error display components
const ERROR_TYPES = {
  network: {
    icon: WifiOff,
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your internet connection.',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50'
  },
  server: {
    icon: ServerCrash,
    title: 'Server Error',
    description: 'Something went wrong on our end. Please try again later.',
    color: 'text-red-500',
    bgColor: 'bg-red-50'
  },
  notFound: {
    icon: FileQuestion,
    title: 'Not Found',
    description: 'The requested resource could not be found.',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50'
  },
  default: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    color: 'text-red-500',
    bgColor: 'bg-red-50'
  }
};

export function ErrorDisplay({ 
  error, 
  type = 'default', 
  onRetry, 
  compact = false,
  className = '' 
}) {
  const errorType = ERROR_TYPES[type] || ERROR_TYPES.default;
  const Icon = errorType.icon;
  
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || errorType.description;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-3 ${errorType.bgColor} rounded-xl ${className}`}>
        <Icon className={`w-5 h-5 ${errorType.color}`} />
        <span className="text-sm text-gray-700 flex-1">{errorMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`p-4 ${errorType.bgColor} rounded-full mb-4`}>
        <Icon className={`w-8 h-8 ${errorType.color}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{errorType.title}</h3>
      <p className="text-sm text-gray-500 text-center mb-4 max-w-sm">{errorMessage}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-xl hover:bg-violet-200 transition-colors font-medium text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

// Loading state wrapper
export function LoadingWrapper({ 
  loading, 
  error, 
  onRetry, 
  skeleton, 
  children,
  minHeight = 'min-h-[200px]'
}) {
  if (loading) {
    return skeleton || (
      <div className={`flex items-center justify-center ${minHeight}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={minHeight}>
        <ErrorDisplay error={error} onRetry={onRetry} />
      </div>
    );
  }

  return children;
}

// Inline loading spinner
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  };

  return (
    <div 
      className={`${sizes[size]} border-violet-200 border-t-violet-600 rounded-full animate-spin ${className}`}
    />
  );
}

// Button with loading state
export function LoadingButton({ 
  loading, 
  disabled, 
  children, 
  onClick, 
  className = '',
  variant = 'primary'
}) {
  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-300',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400',
    outline: 'border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:text-gray-400'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${variants[variant]} ${className}`}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  );
}

// Refresh indicator
export function RefreshIndicator({ lastUpdated, onRefresh, loading }) {
  const formatTime = (date) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <span>Updated {formatTime(lastUpdated)}</span>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}

// Optimistic update indicator
export function OptimisticIndicator({ pending }) {
  if (!pending) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in z-50">
      <LoadingSpinner size="sm" className="border-gray-600 border-t-white" />
      <span className="text-sm">Saving changes...</span>
    </div>
  );
}

// Empty state component
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionLabel,
  className = '' 
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {Icon && (
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action}
          className="px-4 py-2 bg-violet-100 text-violet-700 rounded-xl hover:bg-violet-200 transition-colors font-medium text-sm"
        >
          {actionLabel || 'Get Started'}
        </button>
      )}
    </div>
  );
}

// Skeleton pulse animation wrapper
export function SkeletonPulse({ children, className = '' }) {
  return (
    <div className={`animate-pulse ${className}`}>
      {children}
    </div>
  );
}

// Data status badge
export function DataStatusBadge({ status, className = '' }) {
  const statuses = {
    loading: { label: 'Loading...', color: 'bg-blue-100 text-blue-700' },
    error: { label: 'Error', color: 'bg-red-100 text-red-700' },
    stale: { label: 'Stale', color: 'bg-yellow-100 text-yellow-700' },
    fresh: { label: 'Up to date', color: 'bg-green-100 text-green-700' }
  };

  const statusInfo = statuses[status] || statuses.loading;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color} ${className}`}>
      {statusInfo.label}
    </span>
  );
}
