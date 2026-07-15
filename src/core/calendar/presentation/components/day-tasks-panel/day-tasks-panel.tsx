'use client';

import { useMemo } from 'react';
import { CareScheduleRow } from '@/core/care-schedule/presentation/components/care-schedule-row/care-schedule-row';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { MONTH_KEYS } from '../../../domain/constants/month-keys.constant';
import { toISODate } from '../../utils/to-iso-date/to-iso-date.util';

type Dict = {
  todayPrefix: string;
  monthAbbreviations: Record<(typeof MONTH_KEYS)[number], string>;
};

type Props = {
  selectedDate: string;
  dict: Dict;
  careScheduleDict: AppDict['careSchedule'];
  careSchedules: CareSchedule[];
  isLoading: boolean;
  plants: { id: string; name: string }[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
};

export function DayTasksPanel({
  selectedDate,
  dict,
  careScheduleDict,
  careSchedules,
  isLoading,
  plants,
  onComplete,
  onDelete,
}: Props) {
  const todayISO = toISODate(new Date());
  const isToday = selectedDate === todayISO;

  const date = new Date(selectedDate + 'T00:00:00');
  const day = date.getDate();
  const monthAbbr = dict.monthAbbreviations[MONTH_KEYS[date.getMonth()]];
  const formattedDate = `${day} ${monthAbbr}`;

  const header = isToday ? `${dict.todayPrefix} · ${formattedDate}` : formattedDate;

  const plantNameById = useMemo(
    () => Object.fromEntries(plants.map((plant) => [plant.id, plant.name])),
    [plants],
  );

  return (
    <div className="flex h-full flex-col border-t border-[var(--rule)] bg-[var(--paper)]">
      <div className="border-b border-[var(--rule)] px-5 py-4">
        <p className="eyebrow">{header}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
        {!isLoading && careSchedules.length === 0 && (
          <p className="text-sm text-muted-foreground">{careScheduleDict.panel.empty}</p>
        )}
        {careSchedules.map((careSchedule) => (
          <CareScheduleRow
            key={careSchedule.id}
            careSchedule={careSchedule}
            dict={careScheduleDict}
            plantName={plantNameById[careSchedule.plantId]}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
