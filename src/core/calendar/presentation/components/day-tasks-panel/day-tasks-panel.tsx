'use client';

import { InDevelopment } from '@/shared/presentation/components/in-development/in-development';
import { toISODate } from '../../utils/calendar.utils';

type Dict = {
  todayPrefix: string;
  inDevLabel: string;
};

type Props = {
  selectedDate: string;
  dict: Dict;
};

const MONTH_NAMES: Record<number, string> = {
  0: 'ene', 1: 'feb', 2: 'mar', 3: 'abr', 4: 'may', 5: 'jun',
  6: 'jul', 7: 'ago', 8: 'sep', 9: 'oct', 10: 'nov', 11: 'dic',
};

export function DayTasksPanel({ selectedDate, dict }: Props) {
  const todayISO = toISODate(new Date());
  const isToday = selectedDate === todayISO;

  const date = new Date(selectedDate + 'T00:00:00');
  const day = date.getDate();
  const monthAbbr = MONTH_NAMES[date.getMonth()];
  const formattedDate = `${day} ${monthAbbr}`;

  const header = isToday ? `${dict.todayPrefix} · ${formattedDate}` : formattedDate;

  return (
    <div className="flex h-full flex-col border-l border-[var(--rule)] bg-[var(--paper)]">
      <div className="border-b border-[var(--rule)] px-5 py-4">
        <p className="eyebrow">{header}</p>
      </div>
      <div className="flex-1 p-5">
        <InDevelopment label={dict.inDevLabel} />
      </div>
    </div>
  );
}
