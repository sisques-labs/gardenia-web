import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ className, page, totalPages, onPageChange, ...props }, ref) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
      <div ref={ref} className={cn('flex items-center gap-1', className)} {...props}>
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded text-[var(--ink-2)] disabled:opacity-40 hover:bg-[var(--paper-2)] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onPageChange(p)}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded text-sm transition-colors',
              p === page
                ? 'bg-[var(--forest)] text-[var(--white)] font-semibold tnum'
                : 'text-[var(--ink-2)] hover:bg-[var(--paper-2)]',
            )}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded text-[var(--ink-2)] disabled:opacity-40 hover:bg-[var(--paper-2)] transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  },
);
Pagination.displayName = 'Pagination';

export { Pagination };
