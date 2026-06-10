import * as React from 'react';
import { Button } from '@/shared/presentation/components/ui/button';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  labels?: {
    previous?: string;
    next?: string;
    pageOf?: (page: number, totalPages: number) => string;
  };
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
  labels,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const prevLabel = labels?.previous ?? 'Previous';
  const nextLabel = labels?.next ?? 'Next';
  const pageLabel = labels?.pageOf
    ? labels.pageOf(page, totalPages)
    : `${page} / ${totalPages}`;

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!canPrev}
        aria-label={prevLabel}
      >
        {prevLabel}
      </Button>
      <span aria-live="polite">{pageLabel}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!canNext}
        aria-label={nextLabel}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
