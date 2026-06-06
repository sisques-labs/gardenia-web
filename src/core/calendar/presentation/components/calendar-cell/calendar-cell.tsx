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
    return <div aria-hidden="true" data-testid="calendar-empty-slot" className="bg-[var(--paper-2)] min-h-16 rounded-sm" />;
  }

  return (
    <div
      className={cn(
        'min-h-16 rounded-sm',
        isToday && 'is-today bg-[var(--paper-3)]',
        !isToday && 'bg-[var(--paper)]',
      )}
    >
      <Button
        variant="ghost"
        aria-selected={isSelected}
        aria-label={`Día ${day}`}
        onClick={() => onSelect(day)}
        className={cn(
          'w-full h-full min-h-16 p-1.5 justify-start rounded-sm transition-shadow',
          isSelected && 'ring-2 ring-[var(--forest)] ring-inset',
          isToday ? 'text-[var(--honey-2)] font-semibold' : 'text-[var(--ink)]',
        )}
      >
        <span className="text-sm leading-none">{day}</span>
      </Button>
    </div>
  );
}
