'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { t } from '@/shared/presentation/i18n/interpolate';

type Dict = {
  dayAriaLabel: string;
  todayBadge: string;
};

type Props = {
  day: number | null;
  isToday: boolean;
  isSelected: boolean;
  onSelect: (day: number) => void;
  dict: Dict;
  taskCount?: number;
};

export function CalendarCell({ day, isToday, isSelected, onSelect, dict, taskCount }: Props) {
  if (day === null) {
    return <div aria-hidden="true" data-testid="calendar-empty-slot" className="bg-[var(--paper-2)] h-full" />;
  }

  return (
    <div
      className={cn(
        'h-full',
        isToday && 'is-today',
        !isToday && 'bg-[var(--paper)]',
      )}
      style={isToday ? { backgroundColor: 'oklch(0.93 0.06 75)' } : undefined}
    >
      <Button
        variant="ghost"
        aria-selected={isSelected}
        aria-label={t(dict.dayAriaLabel, { day })}
        onClick={() => onSelect(day)}
        className={cn(
          'w-full h-full p-1 sm:p-2 flex-col justify-start items-start rounded-none transition-shadow',
          isSelected && 'ring-2 ring-[var(--forest)] ring-inset',
          isToday ? 'text-[var(--honey-2)] font-semibold' : 'text-[var(--ink)]',
        )}
      >
        <span className="flex items-center gap-1.5 text-xs sm:text-sm leading-none">
          {day}
          {isToday && (
            <span className="eyebrow text-[var(--honey-2)] text-[9px] hidden sm:inline">{dict.todayBadge}</span>
          )}
        </span>
        {!!taskCount && (
          <span
            data-testid="calendar-cell-task-count"
            className="mt-auto self-end flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--forest)] px-1 text-[10px] font-medium leading-none text-white"
          >
            {taskCount}
          </span>
        )}
      </Button>
    </div>
  );
}
