import { useState, useCallback } from "react";

type SortDirection = "asc" | "desc";

interface SortState<T> {
  field: keyof T | null;
  direction: SortDirection;
}

interface UseSortReturn<T> {
  sortState: SortState<T>;
  sortedItems: T[];
  toggleSort: (field: keyof T) => void;
  setSortState: (state: SortState<T>) => void;
}

export function useSort<T extends Record<string, any>>(
  items: T[],
  initialSort?: SortState<T>
): UseSortReturn<T> {
  const [sortState, setSortState] = useState<SortState<T>>(
    initialSort || { field: null, direction: "asc" }
  );

  const toggleSort = useCallback(
    (field: keyof T) => {
      setSortState((current) => ({
        field,
        direction:
          current.field === field && current.direction === "asc" ? "desc" : "asc",
      }));
    },
    []
  );

  const sortedItems = useCallback(
    (items: T[]): T[] => {
      if (!sortState.field) return items;

      return [...items].sort((a, b) => {
        const aValue = a[sortState.field!];
        const bValue = b[sortState.field!];

        if (aValue === bValue) return 0;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortState.direction === "asc" ? comparison : -comparison;
      });
    },
    [sortState]
  )(items);

  return {
    sortState,
    sortedItems,
    toggleSort,
    setSortState,
  };
}