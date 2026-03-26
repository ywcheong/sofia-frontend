import { useState, useCallback } from 'react';
import type { SortDirection } from '@/types/api';

export interface SortState {
  field: string | null;
  direction: SortDirection;
}

export interface UseTableSortingOptions {
  defaultField?: string;
  defaultDirection?: SortDirection;
}

export interface UseTableSortingReturn {
  sortState: SortState;
  setSortField: (field: string | null) => void;
  setSortDirection: (direction: SortDirection) => void;
  toggleSort: (field: string) => void;
  resetSort: () => void;
  getSortParam: () => string | null;
  getSortParams: () => string[];
}

export function useTableSorting(
  options: UseTableSortingOptions = {}
): UseTableSortingReturn {
  const { defaultField = null, defaultDirection = 'ASC' } = options;

  const [sortState, setSortState] = useState<SortState>({
    field: defaultField,
    direction: defaultDirection,
  });

  const setSortField = useCallback((field: string | null) => {
    setSortState((prev) => ({
      ...prev,
      field,
    }));
  }, []);

  const setSortDirection = useCallback((direction: SortDirection) => {
    setSortState((prev) => ({
      ...prev,
      direction,
    }));
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSortState((prev) => {
      if (prev.field !== field) {
        return { field, direction: 'ASC' };
      }
      return {
        field,
        direction: prev.direction === 'ASC' ? 'DESC' : 'ASC',
      };
    });
  }, []);

  const resetSort = useCallback(() => {
    setSortState({
      field: defaultField,
      direction: defaultDirection,
    });
  }, [defaultField, defaultDirection]);

  const getSortParam = useCallback((): string | null => {
    if (!sortState.field) {
      return null;
    }
    return `${sortState.field},${sortState.direction}`;
  }, [sortState]);

  const getSortParams = useCallback((): string[] => {
    if (!sortState.field) {
      return [];
    }
    return [`${sortState.field},${sortState.direction}`];
  }, [sortState]);

  return {
    sortState,
    setSortField,
    setSortDirection,
    toggleSort,
    resetSort,
    getSortParam,
    getSortParams,
  };
}
