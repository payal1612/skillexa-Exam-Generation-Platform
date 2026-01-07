/**
 * Enhanced Authentication & API Helper
 * Handles 401 errors, token management, and retry logic
 * 
 * Usage:
 * import { apiCall, withAuth } from './apiHelper'
 * 
 * const user = await apiCall('/api/users/profile');
 * const result = await apiCall('/api/data', { method: 'POST', body: {...} });
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Event emitter for auth state changes
class AuthEmitter {
  constructor() {
    this.listeners = [];
  }

  on(listener) {
    this.listeners.push(listener);
    return () => this.listeners = this.listeners.filter(l => l !== listener);
  }

  emit(event, data) {
    this.listeners.forEach(l => l(event, data));
  }
}

export const authEmitter = new AuthEmitter();

/**
 * Get stored token from localStorage
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get stored user from localStorage
 */
export function getUser() {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

/**
 * Set authentication token and user
 */
export function setAuth(token, user = null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  authEmitter.emit('auth-change', { token, user });
}

/**
 * Clear authentication
 */
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  authEmitter.emit('logout');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  return !!getToken();
}

/**
 * Validate JWT token format
 */
export function isValidToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3;
}

/**
 * Decode JWT token (without verification)
 */
export function decodeToken(token) {
  try {
    if (!isValidToken(token)) return null;
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  // exp is in seconds, convert to milliseconds and add 1 minute buffer
  const expiryTime = decoded.exp * 1000 - 60000;
  return Date.now() > expiryTime;
}

/**
 * Main API call function with error handling and auth
 */
export async function apiCall(
  endpoint,
  options = {}
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  // Validate token before making request
  if (token && isTokenExpired(token)) {
    clearAuth();
    authEmitter.emit('token-expired');
    throw new Error('Session expired. Please login again.');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    if (!isValidToken(token)) {
      console.warn('Invalid token format');
      clearAuth();
      throw new Error('Invalid authentication token');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      clearAuth();
      authEmitter.emit('unauthorized');
      throw new UnauthorizedError('Unauthorized. Please login again.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || `Request failed: ${response.status}`,
        response.status,
        errorData
      );
    }

    // Success
    const data = await response.json();
    return data;
  } catch (error) {
    // Log error details for debugging
    console.error(`API Error [${endpoint}]:`, {
      message: error.message,
      status: error.status,
      details: error.details,
    });
    throw error;
  }
}

/**
 * Wrapper for GET requests
 */
export async function apiGet(endpoint, options = {}) {
  return apiCall(endpoint, { ...options, method: 'GET' });
}

/**
 * Wrapper for POST requests
 */
export async function apiPost(endpoint, body, options = {}) {
  return apiCall(endpoint, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Wrapper for PUT requests
 */
export async function apiPut(endpoint, body, options = {}) {
  return apiCall(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * Wrapper for DELETE requests
 */
export async function apiDelete(endpoint, options = {}) {
  return apiCall(endpoint, { ...options, method: 'DELETE' });
}

/**
 * Wrapper for PATCH requests
 */
export async function apiPatch(endpoint, body, options = {}) {
  return apiCall(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/**
 * Custom error classes
 */
export class APIError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Hook to listen to auth changes (for React components)
 */
export function useAuthListener() {
  const [authState, setAuthState] = React.useState({
    token: getToken(),
    user: getUser(),
    isAuthenticated: isAuthenticated(),
  });

  React.useEffect(() => {
    const unsubscribe = authEmitter.on((event, data) => {
      if (event === 'auth-change') {
        setAuthState({
          token: getToken(),
          user: getUser(),
          isAuthenticated: isAuthenticated(),
        });
      } else if (event === 'logout') {
        setAuthState({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      }
    });

    return unsubscribe;
  }, []);

  return authState;
}

/**
 * Higher-order component to protect routes
 */
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated } = useAuthListener();

    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }

    return <Component {...props} />;
  };
}

/**
 * Retry logic for failed requests
 */
export async function apiCallWithRetry(
  endpoint,
  options = {},
  retries = 3,
  delay = 1000
) {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiCall(endpoint, options);
    } catch (error) {
      // Don't retry on 401 or 404
      if (error.status === 401 || error.status === 404) {
        throw error;
      }

      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      } else {
        throw error;
      }
    }
  }
}

/**
 * Export everything as a namespace for easier importing
 */
export default {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
  apiCallWithRetry,
  getToken,
  getUser,
  setAuth,
  clearAuth,
  isAuthenticated,
  isValidToken,
  isTokenExpired,
  decodeToken,
  authEmitter,
};
