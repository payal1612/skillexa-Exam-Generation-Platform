/**
 * useAPI Hook - Production-ready hook for API calls with auth
 * 
 * Usage:
 * const { data, loading, error, refetch } = useAPI('/api/users/profile');
 * const { mutate, loading, error } = useMutation('/api/users/profile', 'PUT');
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
  UnauthorizedError,
  NotFoundError,
  APIError,
} from './apiHelper';

/**
 * Hook for fetching data from API
 */
export function useAPI(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchCount, setRefetchCount] = useState(0);

  const { skip = false, onSuccess, onError, retries = 3 } = options;

  const fetchData = useCallback(async () => {
    if (skip) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let result = null;
      let lastError = null;

      // Retry logic
      for (let i = 0; i < retries; i++) {
        try {
          result = await apiGet(endpoint);
          break;
        } catch (err) {
          lastError = err;
          // Don't retry on 401 or 404
          if (err instanceof UnauthorizedError || err instanceof NotFoundError) {
            throw err;
          }
          // Wait before retrying
          if (i < retries - 1) {
            await new Promise(resolve => 
              setTimeout(resolve, 1000 * Math.pow(2, i))
            );
          }
        }
      }

      if (lastError) throw lastError;

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      setError(err);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, skip, retries, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refetchCount]);

  const refetch = useCallback(() => {
    setRefetchCount(prev => prev + 1);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    isError: !!error,
    isUnauthorized: error instanceof UnauthorizedError,
    isNotFound: error instanceof NotFoundError,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE, etc)
 */
export function useMutation(endpoint, method = 'POST', options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { onSuccess, onError, onMutate } = options;
  const abortControllerRef = useRef(null);

  const mutate = useCallback(
    async (body = null, mutateOptions = {}) => {
      // Cancel previous request if still pending
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      const { rollbackData } = mutateOptions;

      // Call onMutate for optimistic updates
      const context = onMutate?.({ body });

      try {
        setLoading(true);
        setError(null);

        let result;

        // Call appropriate API method
        switch (method.toUpperCase()) {
          case 'POST':
            result = await apiPost(endpoint, body);
            break;
          case 'PUT':
            result = await apiPut(endpoint, body);
            break;
          case 'PATCH':
            result = await apiPatch(endpoint, body);
            break;
          case 'DELETE':
            result = await apiDelete(endpoint);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        setData(result);
        onSuccess?.(result, { body });
        return result;
      } catch (err) {
        setError(err);
        onError?.(err, { body }, context);

        // Rollback on error if provided
        if (rollbackData) {
          context?.rollback?.(rollbackData);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, onSuccess, onError, onMutate]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    mutate,
    data,
    loading,
    error,
    reset,
    isError: !!error,
    isUnauthorized: error instanceof UnauthorizedError,
  };
}

/**
 * Hook for paginated data
 */
export function usePaginatedAPI(endpoint, options = {}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(options.pageSize || 10);
  const [totalPages, setTotalPages] = useState(0);

  const { onSuccess, onError } = options;

  const paginatedEndpoint = `${endpoint}?page=${page}&limit=${pageSize}`;

  const { data, loading, error, refetch } = useAPI(paginatedEndpoint, {
    onSuccess: (result) => {
      if (result.pagination) {
        setTotalPages(result.pagination.totalPages || 1);
      }
      onSuccess?.(result);
    },
    onError,
  });

  const goToPage = useCallback((newPage) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (page < totalPages) setPage(p => p + 1);
  }, [page, totalPages]);

  const prevPage = useCallback(() => {
    if (page > 1) setPage(p => p - 1);
  }, [page]);

  return {
    data: data?.items || [],
    loading,
    error,
    refetch,
    pagination: {
      page,
      pageSize,
      totalPages,
      total: data?.pagination?.total || 0,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
  };
}

/**
 * Hook for infinite scrolling
 */
export function useInfiniteAPI(endpoint, options = {}) {
  const [allData, setAllData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageSize = options.pageSize || 20;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const data = await apiGet(`${endpoint}?page=${page}&limit=${pageSize}`);

      const newItems = data.items || [];
      setAllData(prev => [...prev, ...newItems]);

      // Check if there are more pages
      const totalPages = data.pagination?.totalPages || 1;
      setHasMore(page < totalPages);
      setPage(prev => prev + 1);

      options.onSuccess?.(newItems);
    } catch (err) {
      setError(err);
      options.onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, pageSize, loading, hasMore, options]);

  const reset = useCallback(() => {
    setAllData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
  };
}

/**
 * Hook for polling data at intervals
 */
export function usePollingAPI(endpoint, interval = 5000, options = {}) {
  const { onSuccess, onError, enabled = true } = options;

  const { data, loading, error, refetch } = useAPI(endpoint, {
    onSuccess,
    onError,
  });

  useEffect(() => {
    if (!enabled) return;

    const pollingInterval = setInterval(() => {
      refetch();
    }, interval);

    return () => clearInterval(pollingInterval);
  }, [interval, enabled, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook to handle API errors with user feedback
 */
export function useAPIErrorHandler() {
  const handleError = useCallback((error, fallbackMessage = 'An error occurred') => {
    if (error instanceof UnauthorizedError) {
      return {
        message: 'Your session has expired. Please login again.',
        type: 'unauthorized',
        action: 'login',
      };
    }

    if (error instanceof NotFoundError) {
      return {
        message: 'Resource not found.',
        type: 'not-found',
        action: null,
      };
    }

    if (error instanceof APIError) {
      return {
        message: error.message || fallbackMessage,
        type: 'api-error',
        status: error.status,
        details: error.details,
      };
    }

    return {
      message: error.message || fallbackMessage,
      type: 'unknown',
      action: null,
    };
  }, []);

  return { handleError };
}

export default {
  useAPI,
  useMutation,
  usePaginatedAPI,
  useInfiniteAPI,
  usePollingAPI,
  useAPIErrorHandler,
};
