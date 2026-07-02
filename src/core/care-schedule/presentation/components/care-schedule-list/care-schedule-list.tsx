'use client';

import { useState } from 'react';
import { useCareSchedules } from '@/core/care-schedule/presentation/hooks/use-care-schedules/use-care-schedules.hook';
import { useCompleteCareSchedule } from '@/core/care-schedule/presentation/hooks/use-complete-care-schedule/use-complete-care-schedule.hook';
import { useDeleteCareSchedule } from '@/core/care-schedule/presentation/hooks/use-delete-care-schedule/use-delete-care-schedule.hook';
import { CareScheduleRow } from '@/core/care-schedule/presentation/components/care-schedule-row/care-schedule-row';
import { CareScheduleModal } from '@/core/care-schedule/presentation/components/care-schedule-modal/care-schedule-modal';
import type { CareSchedule } from '@/core/care-schedule/domain/types/care-schedule.interface';
import { Button } from '@/shared/presentation/components/ui/button/button';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  plantId: string;
  dict: AppDict['careSchedule'];
};

export function CareScheduleList({ plantId, dict }: Props) {
  const { careSchedules } = useCareSchedules({ plantId });
  const { mutate: completeCareSchedule } = useCompleteCareSchedule();
  const { mutate: deleteCareSchedule } = useDeleteCareSchedule();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCareSchedule, setEditingCareSchedule] = useState<CareSchedule | null>(null);

  return (
    <>
      <div className="pt-6 flex flex-col gap-4">
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            + {dict.tab.newTask}
          </Button>
        </div>
        {careSchedules.length === 0 ? (
          <p className="text-sm text-muted-foreground">{dict.tab.empty}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {careSchedules.map((careSchedule) => (
              <CareScheduleRow
                key={careSchedule.id}
                careSchedule={careSchedule}
                dict={dict}
                onComplete={(id) => completeCareSchedule({ id })}
                onEdit={setEditingCareSchedule}
                onDelete={(id) => deleteCareSchedule(id)}
              />
            ))}
          </div>
        )}
      </div>

      {isCreateOpen && (
        <CareScheduleModal dict={dict} lockedPlantId={plantId} onClose={() => setIsCreateOpen(false)} />
      )}
      {editingCareSchedule && (
        <CareScheduleModal
          dict={dict}
          careSchedule={editingCareSchedule}
          onClose={() => setEditingCareSchedule(null)}
        />
      )}
    </>
  );
}
