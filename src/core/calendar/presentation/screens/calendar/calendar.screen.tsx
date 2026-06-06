'use client';

import { useCalendarStore } from '../../../infrastructure/store/calendar.store';
import { CalendarGrid } from '../../components/calendar-grid/calendar-grid';
import { DayTasksPanel } from '../../components/day-tasks-panel/day-tasks-panel';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';

type GridDict = {
  weekdays: { mon: string; tue: string; wed: string; thu: string; fri: string; sat: string; sun: string };
  seasons: { spring: string; summer: string; autumn: string; winter: string };
  months: {
    january: string; february: string; march: string; april: string;
    may: string; june: string; july: string; august: string;
    september: string; october: string; november: string; december: string;
  };
  overflow: string;
  viewSwitcher: { day: string; week: string; month: string; year: string };
};

type Props = {
  dict: {
    screenTitle: string;
    addTask: string;
    viewSwitcher: { day: string; week: string; month: string; year: string };
    grid: GridDict;
    panel: { todayPrefix: string; inDevLabel: string };
  };
};

export function CalendarScreen({ dict }: Props) {
  const { selectedDate, currentYear, currentMonth, prevMonth, nextMonth, setSelectedDate } =
    useCalendarStore();

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader title={dict.screenTitle} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <CalendarGrid
            year={currentYear}
            month={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            dict={dict.grid}
          />
        </div>

        <div className="w-72 shrink-0 overflow-y-auto">
          <DayTasksPanel selectedDate={selectedDate} dict={dict.panel} />
        </div>
      </div>
    </div>
  );
}
