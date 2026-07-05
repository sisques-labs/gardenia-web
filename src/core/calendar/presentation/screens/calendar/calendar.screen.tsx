'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { useCareSchedules } from '@/core/care-schedule/presentation/hooks/use-care-schedules/use-care-schedules.hook';
import { useCompleteCareSchedule } from '@/core/care-schedule/presentation/hooks/use-complete-care-schedule/use-complete-care-schedule.hook';
import { useDeleteCareSchedule } from '@/core/care-schedule/presentation/hooks/use-delete-care-schedule/use-delete-care-schedule.hook';
import { CareScheduleModal } from '@/core/care-schedule/presentation/components/care-schedule-modal/care-schedule-modal';
import { usePlants } from '@/core/plants/presentation/hooks/use-plants/use-plants.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { useCalendarStore } from '../../../infrastructure/store/calendar.store';
import { CalendarGrid } from '../../components/calendar-grid/calendar-grid';
import { CalendarViewSwitcher } from '../../components/calendar-view-switcher/calendar-view-switcher';
import { DayTasksPanel } from '../../components/day-tasks-panel/day-tasks-panel';
import { getSeason } from '../../utils/get-season/get-season.util';
import { getDaysInMonth } from '../../utils/get-days-in-month/get-days-in-month.util';
import { groupCareSchedulesByDay } from '../../utils/group-care-schedules-by-day/group-care-schedules-by-day.util';
import { MONTH_KEYS } from '../../../domain/constants/month-keys.constant';
import { SEASON_KEYS } from '../../../domain/constants/season-keys.constant';

type Props = {
  dict: AppDict['calendar'];
  careScheduleDict: AppDict['careSchedule'];
};

export function CalendarScreen({ dict, careScheduleDict }: Props) {
  const { selectedDate, currentYear, currentMonth, prevMonth, nextMonth, setSelectedDate } =
    useCalendarStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const { careSchedules, isLoading } = useCareSchedules({ active: true, dueOnDay: selectedDate });

  const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthStart = `${monthPrefix}-01`;
  const monthEnd = `${monthPrefix}-${String(getDaysInMonth(currentYear, currentMonth)).padStart(2, '0')}`;
  const { careSchedules: monthCareSchedules } = useCareSchedules({
    active: true,
    dueFrom: monthStart,
    dueTo: monthEnd,
  });
  const taskCountByDate = useMemo(
    () => groupCareSchedulesByDay(monthCareSchedules),
    [monthCareSchedules],
  );

  const { data: plants } = usePlants(spaceId);
  const { mutate: completeCareSchedule } = useCompleteCareSchedule();
  const { mutate: deleteCareSchedule } = useDeleteCareSchedule();

  const monthName = dict.grid.months[MONTH_KEYS[currentMonth]];
  const seasonLabel = dict.grid.seasons[SEASON_KEYS[getSeason(currentMonth)]];

  return (
    <div className="flex flex-col md:h-full">
      <ScreenHeader
        eyebrow={`${dict.screenTitle} · ${dict.monthlyView}`}
        title={`${monthName} ${currentYear}`}
        subtitle={`· ${seasonLabel}`}
        actions={
          <>
            <div className="hidden md:block">
              <CalendarViewSwitcher activeView="month" dict={dict.grid.viewSwitcher} />
            </div>
            <Button variant="ghost" size="icon" aria-label={dict.navigation.prevMonth} onClick={prevMonth}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="ghost" size="icon" aria-label={dict.navigation.nextMonth} onClick={nextMonth}>
              <ChevronRight size={18} />
            </Button>
            <Button
              size="sm"
              aria-label={dict.addTask}
              className="ml-1 bg-[var(--forest)] hover:bg-[var(--forest-2)] text-white gap-1"
              onClick={() => setIsCreateOpen(true)}
            >
              + <span className="hidden sm:inline">{dict.addTask}</span>
            </Button>
          </>
        }
      />

      <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden">
        <div className="flex-1 p-3 md:p-6 flex flex-col md:overflow-hidden">
          <CalendarGrid
            year={currentYear}
            month={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            dict={{
              weekdays: dict.grid.weekdays,
              dayAriaLabel: dict.grid.dayAriaLabel,
              todayBadge: dict.grid.todayBadge,
            }}
            taskCountByDate={taskCountByDate}
          />
        </div>

        <div className="md:w-72 md:shrink-0 md:overflow-y-auto">
          <DayTasksPanel
            selectedDate={selectedDate}
            dict={dict.panel}
            careScheduleDict={careScheduleDict}
            careSchedules={careSchedules}
            isLoading={isLoading}
            plants={plants ?? []}
            onComplete={(id) => completeCareSchedule({ id })}
            onDelete={(id) => deleteCareSchedule(id)}
          />
        </div>
      </div>

      {isCreateOpen && (
        <CareScheduleModal dict={careScheduleDict} onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
