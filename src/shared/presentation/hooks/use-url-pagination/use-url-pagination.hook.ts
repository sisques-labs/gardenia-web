import { useUrlPage } from '@/shared/presentation/hooks/use-url-page/use-url-page.hook';

export interface UseUrlPaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  pagedItems: T[];
  onPageChange: (page: number) => void;
}

const DEFAULT_PAGE_SIZE = 20;

export function useUrlPagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE): UseUrlPaginationReturn<T> {
  const { page, onPageChange } = useUrlPage();

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return { currentPage, totalPages, pagedItems, onPageChange };
}
