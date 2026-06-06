'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { getSeason } from '../../utils/get-season/get-season.util';
import { MONTH_KEYS } from '../../../domain/constants/month-keys.constant';
import { SEASON_KEYS } from '../../../domain/constants/season-keys.constant';
import { WEEKDAY_KEYS } from '../../../domain/constants/weekday-keys.constant';
import { useCalendarGrid } from '../../hooks/use-calendar-grid/use-calendar-grid.hook';
import { CalendarCell } from '../calendar-cell/calendar-cell';
import { CalendarViewSwitcher } from '../calendar-view-switcher/calendar-view-switcher';

type Props = {
  year: number;
  month: number;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  dict: AppDict['calendar']['grid'];
};

export function CalendarGrid({
  year,
  month,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  dict,
}: Props) {
  const { cells, todayISO, handleSelectDay } = useCalendarGrid({ year, month, onSelectDate });

  const season = getSeason(month);
  const monthName = dict.months[MONTH_KEYS[month]];
  const seasonLabel = dict.seasons[SEASON_KEYS[season]];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="headline">{monthName}</span>
          <span className="text-[var(--ink-3)] text-lg">{year}</span>
          <span className="text-[var(--terracotta)] text-sm">· {seasonLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarViewSwitcher activeView="month" dict={dict.viewSwitcher} />
          <Button variant="ghost" size="icon" aria-label="Mes anterior" onClick={onPrevMonth}>
            <ChevronLeft size={18} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Mes siguiente" onClick={onNextMonth}>
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div role="grid" className="flex flex-col gap-px">
        <div role="row" className="grid grid-cols-7 gap-px">
          {WEEKDAY_KEYS.map((key) => (
            <div key={key} role="columnheader" className="eyebrow text-center py-1">
              {dict.weekdays[key]}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px">
          {cells.map((day, idx) => {
            const m = String(month + 1).padStart(2, '0');
            const d = day !== null ? String(day).padStart(2, '0') : null;
            const iso = d ? `${year}-${m}-${d}` : null;
            return (
              <CalendarCell
                key={idx}
                day={day}
                isToday={iso === todayISO}
                isSelected={iso === selectedDate}
                onSelect={handleSelectDay}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
