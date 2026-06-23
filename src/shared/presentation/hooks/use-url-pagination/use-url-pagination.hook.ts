import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface UseUrlPaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  pagedItems: T[];
  onPageChange: (page: number) => void;
}

export function useUrlPagination<T>(items: T[], pageSize: number): UseUrlPaginationReturn<T> {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page') ?? 1));
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const onPageChange = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(p));
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return { currentPage, totalPages, pagedItems, onPageChange };
}
