'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { PageHeader } from '@/shared/presentation/components/page-header/page-header';
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
  const { data: plants } = usePlants(spaceId);
  const { mutate: completeCareSchedule } = useCompleteCareSchedule();
  const { mutate: deleteCareSchedule } = useDeleteCareSchedule();

  const monthName = dict.grid.months[MONTH_KEYS[currentMonth]];
  const seasonLabel = dict.grid.seasons[SEASON_KEYS[getSeason(currentMonth)]];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        eyebrow={`${dict.screenTitle} · ${dict.monthlyView}`}
        title={`${monthName} ${currentYear}`}
        subtitle={`· ${seasonLabel}`}
        actions={
          <>
            <CalendarViewSwitcher activeView="month" dict={dict.grid.viewSwitcher} />
            <Button variant="ghost" size="icon" aria-label={dict.navigation.prevMonth} onClick={prevMonth}>
              <ChevronLeft size={18} />
            </Button>
            <Button variant="ghost" size="icon" aria-label={dict.navigation.nextMonth} onClick={nextMonth}>
              <ChevronRight size={18} />
            </Button>
            <Button
              size="sm"
              className="ml-1 bg-[var(--forest)] hover:bg-[var(--forest-2)] text-white gap-1"
              onClick={() => setIsCreateOpen(true)}
            >
              + {dict.addTask}
            </Button>
          </>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden p-6 flex flex-col">
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
          />
        </div>

        <div className="w-72 shrink-0 overflow-y-auto">
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
