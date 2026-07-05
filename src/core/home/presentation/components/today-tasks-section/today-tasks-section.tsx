'use client';

import { useMemo } from 'react';
import { EmptyState } from '@/shared/presentation/components/ui/empty-state/empty-state';
import { CareScheduleRow } from '@/core/care-schedule/presentation/components/care-schedule-row/care-schedule-row';
import { useCareSchedules } from '@/core/care-schedule/presentation/hooks/use-care-schedules/use-care-schedules.hook';
import { useCompleteCareSchedule } from '@/core/care-schedule/presentation/hooks/use-complete-care-schedule/use-complete-care-schedule.hook';
import { useDeleteCareSchedule } from '@/core/care-schedule/presentation/hooks/use-delete-care-schedule/use-delete-care-schedule.hook';
import { usePlants } from '@/core/plants/presentation/hooks/use-plants/use-plants.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { toISODate } from '@/core/care-schedule/presentation/utils/to-iso-date/to-iso-date.util';
import { TodayTasksSkeleton } from '@/core/home/presentation/components/today-tasks-section-skeleton/today-tasks-section-skeleton';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['home'];
  careScheduleDict: AppDict['careSchedule'];
};

export function TodayTasksSection({ dict, careScheduleDict }: Props) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const { careSchedules, isLoading } = useCareSchedules({ active: true, dueBefore: toISODate(new Date()) });
  const { data: plants } = usePlants(spaceId);
  const { mutate: completeCareSchedule } = useCompleteCareSchedule();
  const { mutate: deleteCareSchedule } = useDeleteCareSchedule();

  const plantNameById = useMemo(
    () => Object.fromEntries((plants ?? []).map((plant) => [plant.id, plant.name])),
    [plants],
  );

  if (isLoading) return <TodayTasksSkeleton />;

  return (
    <div>
      <h2 className="text-base font-semibold mb-4 pb-3 border-b border-[var(--rule)]">{dict.sections.todayTasks.title}</h2>
      {careSchedules.length === 0 ? (
        <EmptyState title={dict.sections.todayTasks.empty} />
      ) : (
        <div className="flex flex-col gap-3">
          {careSchedules.map((careSchedule) => (
            <CareScheduleRow
              key={careSchedule.id}
              careSchedule={careSchedule}
              dict={careScheduleDict}
              plantName={plantNameById[careSchedule.plantId]}
              onComplete={(id) => completeCareSchedule({ id })}
              onDelete={(id) => deleteCareSchedule(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
