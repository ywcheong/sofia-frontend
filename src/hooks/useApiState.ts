import { useState, useCallback } from 'react';
import { ApiError } from '@/api/client';

export interface UseApiStateOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export interface UseApiStateReturn<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  execute: (apiCall: () => Promise<T>) => Promise<T | null>;
  setData: (data: T | null) => void;
  reset: () => void;
  clearError: () => void;
}

export function useApiState<T>(
  options: UseApiStateOptions<T> = {}
): UseApiStateReturn<T> {
  const { initialData = null, onSuccess, onError } = options;

  const [data, setDataState] = useState<T | null>(initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const execute = useCallback(
    async (apiCall: () => Promise<T>): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiCall();
        setDataState(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        let apiError: ApiError;
        if (err instanceof ApiError) {
          apiError = err;
        } else {
          apiError = new ApiError('알 수 없는 오류가 발생했습니다.', 0);
        }
        setError(apiError);
        onError?.(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const setData = useCallback((newData: T | null) => {
    setDataState(newData);
  }, []);

  const reset = useCallback(() => {
    setDataState(initialData ?? null);
    setLoading(false);
    setError(null);
  }, [initialData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    setData,
    reset,
    clearError,
  };
}

export interface UseAsyncActionReturn<T, P extends unknown[]> {
  execute: (...params: P) => Promise<T | null>;
  loading: boolean;
  error: ApiError | null;
  reset: () => void;
}

export function useAsyncAction<T, P extends unknown[] = []>(
  asyncFn: (...params: P) => Promise<T>,
  options: Omit<UseApiStateOptions<T>, 'initialData'> = {}
): UseAsyncActionReturn<T, P> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const { onSuccess, onError } = options;

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFn(...params);
        onSuccess?.(result);
        return result;
      } catch (err) {
        let apiError: ApiError;
        if (err instanceof ApiError) {
          apiError = err;
        } else {
          apiError = new ApiError('알 수 없는 오류가 발생했습니다.', 0);
        }
        setError(apiError);
        onError?.(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    execute,
    loading,
    error,
    reset,
  };
}
