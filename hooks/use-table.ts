import { useState, useMemo } from "react";
import { useSort } from "./use-sort";
import { useFilter } from "./use-filter";
import { usePagination } from "./use-pagination";
import { useSelection } from "./use-selection";

interface UseTableOptions<T> {
  data: T[];
  initialSort?: {
    field: keyof T;
    direction: "asc" | "desc";
  };
  initialFilters?: Partial<Record<keyof T, any>>;
  searchFields?: Array<keyof T>;
  pageSize?: number;
}

export function useTable<T extends Record<string, any> & { id: string }>(
  options: UseTableOptions<T>
) {
  const {
    data,
    initialSort,
    initialFilters,
    searchFields,
    pageSize = 10,
  } = options;

  const { sortState, sortedItems, toggleSort } = useSort(data, initialSort);
  
  const {
    filters,
    searchQuery,
    filteredItems,
    setFilter,
    setSearchQuery,
    resetFilters,
  } = useFilter(sortedItems, { initialFilters, searchFields });

  const {
    page,
    pageSize: currentPageSize,
    setPage,
    setPageSize,
    totalPages,
    from,
    to,
    canPreviousPage,
    canNextPage,
    previousPage,
    nextPage,
    pageNumbers,
  } = usePagination({
    initialPageSize: pageSize,
    total: filteredItems.length,
  });

  const {
    selectedItems,
    selectedIds,
    isSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
  } = useSelection<T>();

  const pageItems = useMemo(() => {
    const start = (page - 1) * currentPageSize;
    const end = start + currentPageSize;
    return filteredItems.slice(start, end);
  }, [filteredItems, page, currentPageSize]);

  return {
    // Data
    items: pageItems,
    totalItems: data.length,
    filteredItemsCount: filteredItems.length,

    // Sorting
    sortState,
    toggleSort,

    // Filtering
    filters,
    searchQuery,
    setFilter,
    setSearchQuery,
    resetFilters,

    // Pagination
    page,
    pageSize: currentPageSize,
    setPage,
    setPageSize,
    totalPages,
    from,
    to,
    canPreviousPage,
    canNextPage,
    previousPage,
    nextPage,
    pageNumbers,

    // Selection
    selectedItems,
    selectedIds,
    isSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
  };
}