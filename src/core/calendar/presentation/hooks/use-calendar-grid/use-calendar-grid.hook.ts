import { getDaysInMonth } from '../../utils/get-days-in-month/get-days-in-month.util';
import { getFirstDayOffset } from '../../utils/get-first-day-offset/get-first-day-offset.util';
import { toISODate } from '../../utils/to-iso-date/to-iso-date.util';

interface UseCalendarGridParams {
  year: number;
  month: number;
  onSelectDate: (iso: string) => void;
}

interface UseCalendarGridResult {
  cells: (number | null)[];
  todayISO: string;
  handleSelectDay: (day: number) => void;
}

export function useCalendarGrid({
  year,
  month,
  onSelectDate,
}: UseCalendarGridParams): UseCalendarGridResult {
  const daysInMonth = getDaysInMonth(year, month);
  const offset = getFirstDayOffset(year, month);

  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const todayISO = toISODate(new Date());

  function handleSelectDay(day: number) {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onSelectDate(`${year}-${m}-${d}`);
  }

  return { cells, todayISO, handleSelectDay };
}
