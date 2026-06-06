'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth, getFirstDayOffset, toISODate, getSeason } from '../../utils/calendar.utils';
import { CalendarCell } from '../calendar-cell/calendar-cell';
import { CalendarViewSwitcher } from '../calendar-view-switcher/calendar-view-switcher';

type WeekdayDict = { mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string };
type SeasonsDict = { spring: string; summer: string; autumn: string; winter: string };
type MonthsDict = {
  january: string; february: string; march: string; april: string;
  may: string; june: string; july: string; august: string;
  september: string; october: string; november: string; december: string;
};
type ViewSwitcherDict = { day: string; week: string; month: string; year: string };

type GridDict = {
  weekdays: WeekdayDict;
  seasons: SeasonsDict;
  months: MonthsDict;
  overflow: string;
  viewSwitcher: ViewSwitcherDict;
};

type Props = {
  year: number;
  month: number;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  dict: GridDict;
};

const MONTH_KEYS: (keyof MonthsDict)[] = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const SEASON_KEYS: Record<ReturnType<typeof getSeason>, keyof SeasonsDict> = {
  primavera: 'spring',
  verano: 'summer',
  otoño: 'autumn',
  invierno: 'winter',
};

const WEEKDAY_KEYS: (keyof WeekdayDict)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function CalendarGrid({
  year,
  month,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  dict,
}: Props) {
  const todayISO = toISODate(new Date());
  const daysInMonth = getDaysInMonth(year, month);
  const offset = getFirstDayOffset(year, month);

  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const season = getSeason(month);
  const monthName = dict.months[MONTH_KEYS[month]];
  const seasonLabel = dict.seasons[SEASON_KEYS[season]];

  function handleSelectDay(day: number) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onSelectDate(`${year}-${m}-${d}`);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="headline">{monthName}</span>
          <span className="text-[var(--ink-3)] text-lg">{year}</span>
          <span className="text-[var(--terracotta)] text-sm">· {seasonLabel}</span>
        </div>

        <div className="flex items-center gap-2">
          <CalendarViewSwitcher activeView="month" dict={dict.viewSwitcher} />
          <button
            type="button"
            aria-label="Mes anterior"
            onClick={onPrevMonth}
            className="btn-reset rounded p-1 text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Mes siguiente"
            onClick={onNextMonth}
            className="btn-reset rounded p-1 text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Grid */}
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
