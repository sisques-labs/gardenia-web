'use client';

import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { WEEKDAY_KEYS } from '../../../domain/constants/weekday-keys.constant';
import { useCalendarGrid } from '../../hooks/use-calendar-grid/use-calendar-grid.hook';
import { CalendarCell } from '../calendar-cell/calendar-cell';

type Props = {
  year: number;
  month: number;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  dict: Pick<AppDict['calendar']['grid'], 'weekdays' | 'dayAriaLabel' | 'todayBadge'>;
  taskCountByDate?: Record<string, number>;
};

export function CalendarGrid({ year, month, selectedDate, onSelectDate, dict, taskCountByDate }: Props) {
  const { cells, todayISO, handleSelectDay } = useCalendarGrid({ year, month, onSelectDate });

  return (
    <div role="grid" className="flex-1 flex flex-col bg-[var(--rule)] border border-[var(--rule)] rounded-sm overflow-hidden">
      <div role="row" className="grid grid-cols-7 gap-px flex-none">
        {WEEKDAY_KEYS.map((key) => (
          <div key={key} role="columnheader" className="eyebrow text-center py-2 bg-[var(--paper-2)]">
            {dict.weekdays[key]}
          </div>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-7 gap-px [grid-auto-rows:minmax(3.5rem,1fr)]">
        {cells.map((day, idx) => {
          const m = String(month + 1).padStart(2, '0');
          const d = day !== null ? String(day).padStart(2, '0') : null;
          const iso = d ? `${year}-${m}-${d}` : null;
          return (
            <CalendarCell
              key={iso ?? `blank-${idx}`}
              day={day}
              isToday={iso === todayISO}
              isSelected={iso === selectedDate}
              onSelect={handleSelectDay}
              dict={{ dayAriaLabel: dict.dayAriaLabel, todayBadge: dict.todayBadge }}
              taskCount={iso ? taskCountByDate?.[iso] : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}
