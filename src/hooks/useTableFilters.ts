import { useState, useCallback } from 'react';

export interface UseTableFiltersOptions<F> {
  defaultFilters?: F;
}

export interface UseTableFiltersReturn<F> {
  filters: F;
  setFilter: <K extends keyof F>(key: K, value: F[K]) => void;
  setFilters: (filters: Partial<F>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export function useTableFilters<F extends object>(
  options: UseTableFiltersOptions<F> = {}
): UseTableFiltersReturn<F> {
  const { defaultFilters } = options;

  const [filters, setFiltersState] = useState<F>(defaultFilters ?? ({} as F));

  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    setFiltersState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<F>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters ?? ({} as F));
  }, [defaultFilters]);

  const hasActiveFilters = Object.values(filters).some((value) => {
    if (value === undefined || value === null || value === '') {
      return false;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  });

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
  };
}
