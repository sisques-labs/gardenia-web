'use client';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/presentation/components/ui/button';

type Props = {
  day: number | null;
  isToday: boolean;
  isSelected: boolean;
  onSelect: (day: number) => void;
};

export function CalendarCell({ day, isToday, isSelected, onSelect }: Props) {
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
        aria-label={`Día ${day}`}
        onClick={() => onSelect(day)}
        className={cn(
          'w-full h-full p-2 justify-start items-start rounded-none transition-shadow',
          isSelected && 'ring-2 ring-[var(--forest)] ring-inset',
          isToday ? 'text-[var(--honey-2)] font-semibold' : 'text-[var(--ink)]',
        )}
      >
        <span className="flex items-center gap-1.5 text-sm leading-none">
          {day}
          {isToday && (
            <span className="eyebrow text-[var(--honey-2)] text-[9px]">hoy</span>
          )}
        </span>
      </Button>
    </div>
  );
}
