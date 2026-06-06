'use client';

import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { useCalendarStore } from '../../../infrastructure/store/calendar.store';
import { CalendarGrid } from '../../components/calendar-grid/calendar-grid';
import { DayTasksPanel } from '../../components/day-tasks-panel/day-tasks-panel';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';

type Props = {
  dict: AppDict['calendar'];
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
