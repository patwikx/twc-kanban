import { useState, useCallback } from "react";

interface UseSelectionReturn<T> {
  selectedItems: T[];
  selectedIds: string[];
  isSelected: (id: string) => boolean;
  toggleSelection: (item: T) => void;
  toggleAll: (items: T[]) => void;
  clearSelection: () => void;
}

export function useSelection<T extends { id: string }>(
  initialSelection: T[] = []
): UseSelectionReturn<T> {
  const [selectedItems, setSelectedItems] = useState<T[]>(initialSelection);

  const selectedIds = selectedItems.map((item) => item.id);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const toggleSelection = useCallback((item: T) => {
    setSelectedItems((current) =>
      isSelected(item.id)
        ? current.filter((i) => i.id !== item.id)
        : [...current, item]
    );
  }, [isSelected]);

  const toggleAll = useCallback((items: T[]) => {
    setSelectedItems((current) =>
      current.length === items.length ? [] : items
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  return {
    selectedItems,
    selectedIds,
    isSelected,
    toggleSelection,
    toggleAll,
    clearSelection,
  };
}