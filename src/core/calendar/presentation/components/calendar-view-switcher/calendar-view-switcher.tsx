'use client';

import { cn } from '@/shared/lib/utils';

type View = 'day' | 'week' | 'month' | 'year';

type Dict = {
  day: string;
  week: string;
  month: string;
  year: string;
};

type Props = {
  activeView: View;
  dict: Dict;
};

const VIEWS: { key: View; dictKey: keyof Dict }[] = [
  { key: 'day', dictKey: 'day' },
  { key: 'week', dictKey: 'week' },
  { key: 'month', dictKey: 'month' },
  { key: 'year', dictKey: 'year' },
];

export function CalendarViewSwitcher({ activeView, dict }: Props) {
  return (
    <div className="flex gap-1 rounded-md bg-[var(--paper-2)] p-0.5">
      {VIEWS.map(({ key, dictKey }) => {
        const isActive = key === activeView;
        const isDisabled = key !== 'month';
        return (
          <button
            key={key}
            type="button"
            disabled={isDisabled}
            className={cn(
              'btn-reset rounded px-3 py-1 text-sm transition-colors',
              isActive
                ? 'active-view bg-[var(--paper)] text-[var(--ink)] shadow-sm'
                : 'text-[var(--ink-3)]',
              isDisabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {dict[dictKey]}
          </button>
        );
      })}
    </div>
  );
}
