import { useState, useEffect, useCallback } from 'react';
import { ApiError } from '@/api/client';
import type { Pageable } from '@/types/api';

export interface PageResponse<T> {
  totalElements: number;
  totalPages: number;
  size: number;
  content: T[];
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UsePaginatedDataOptions<T, F> {
  fetchFn: (page: number, size: number, filters?: F) => Promise<PageResponse<T>>;
  initialSize?: number;
}

export interface UsePaginatedDataReturn<T, F> {
  data: T[];
  loading: boolean;
  error: ApiError | null;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  refresh: () => void;
  setFilters: (filters: F) => void;
}

export function usePaginatedData<T, F>(
  options: UsePaginatedDataOptions<T, F>
): UsePaginatedDataReturn<T, F> {
  const { fetchFn, initialSize = 10 } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(initialSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFiltersState] = useState<F | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn(page, size, filters);
      setData(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(new ApiError('알 수 없는 오류가 발생했습니다.', 0));
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, size, filters, refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPageHandler = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const setSizeHandler = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const setFilters = useCallback((newFilters: F) => {
    setFiltersState(newFilters);
    setPage(0);
  }, []);

  return {
    data,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    setPage: setPageHandler,
    setSize: setSizeHandler,
    refresh,
    setFilters,
  };
}

export interface UsePaginatedDataWithSortOptions<T, F> {
  fetchFn: (page: number, size: number, sort: string[], filters?: F) => Promise<PageResponse<T>>;
  initialSize?: number;
  defaultSort?: string[];
}

export interface UsePaginatedDataWithSortReturn<T, F> {
  data: T[];
  loading: boolean;
  error: ApiError | null;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: string[];
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  setSort: (sort: string[]) => void;
  refresh: () => void;
  setFilters: (filters: F) => void;
  pageable: Pageable;
}

export function usePaginatedDataWithSort<T, F>(
  options: UsePaginatedDataWithSortOptions<T, F>
): UsePaginatedDataWithSortReturn<T, F> {
  const { fetchFn, initialSize = 10, defaultSort = [] } = options;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(initialSize);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sort, setSort] = useState<string[]>(defaultSort);
  const [filters, setFiltersState] = useState<F | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFn(page, size, sort, filters);
      setData(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(new ApiError('알 수 없는 오류가 발생했습니다.', 0));
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, size, sort, filters, refreshKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setPageHandler = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const setSizeHandler = useCallback((newSize: number) => {
    setSize(newSize);
    setPage(0);
  }, []);

  const setSortHandler = useCallback((newSort: string[]) => {
    setSort(newSort);
    setPage(0);
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const setFilters = useCallback((newFilters: F) => {
    setFiltersState(newFilters);
    setPage(0);
  }, []);

  const pageable: Pageable = {
    page,
    size,
    ...(sort.length > 0 ? { sort } : {}),
  };

  return {
    data,
    loading,
    error,
    page,
    size,
    totalElements,
    totalPages,
    sort,
    setPage: setPageHandler,
    setSize: setSizeHandler,
    setSort: setSortHandler,
    refresh,
    setFilters,
    pageable,
  };
}
