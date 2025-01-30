import { useState, useCallback, useMemo } from "react";
import { useDebounce } from "./use-debounce";

interface UseFilterOptions<T> {
  initialFilters?: Partial<Record<keyof T, any>>;
  searchFields?: Array<keyof T>;
}

interface UseFilterReturn<T> {
  filters: Partial<Record<keyof T, any>>;
  searchQuery: string;
  filteredItems: T[];
  setFilter: (field: keyof T, value: any) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

export function useFilter<T extends Record<string, any>>(
  items: T[],
  options: UseFilterOptions<T> = {}
): UseFilterReturn<T> {
  const { initialFilters = {}, searchFields = [] } = options;
  const [filters, setFilters] = useState<Partial<Record<keyof T, any>>>(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const setFilter = useCallback((field: keyof T, value: any) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchQuery("");
  }, [initialFilters]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Apply filters
      const matchesFilters = Object.entries(filters).every(([field, value]) => {
        if (value === undefined || value === null || value === "") return true;
        return item[field] === value;
      });

      if (!matchesFilters) return false;

      // Apply search
      if (debouncedSearchQuery && searchFields.length > 0) {
        const searchValue = debouncedSearchQuery.toLowerCase();
        return searchFields.some((field) => {
          const fieldValue = item[field];
          if (typeof fieldValue === "string") {
            return fieldValue.toLowerCase().includes(searchValue);
          }
          if (typeof fieldValue === "number") {
            return fieldValue.toString().includes(searchValue);
          }
          return false;
        });
      }

      return true;
    });
  }, [items, filters, debouncedSearchQuery, searchFields]);

  return {
    filters,
    searchQuery,
    filteredItems,
    setFilter,
    setSearchQuery,
    resetFilters,
  };
}