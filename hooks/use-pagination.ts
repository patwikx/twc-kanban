import { useState, useMemo } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  total: number;
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  totalPages: number;
  from: number;
  to: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  previousPage: () => void;
  nextPage: () => void;
  pageNumbers: number[];
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  total,
}: UsePaginationOptions): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(total / pageSize);
  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  const previousPage = () => {
    if (canPreviousPage) {
      setPage(page - 1);
    }
  };

  const nextPage = () => {
    if (canNextPage) {
      setPage(page + 1);
    }
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, page - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }, [page, totalPages]);

  return {
    page,
    pageSize,
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
  };
}