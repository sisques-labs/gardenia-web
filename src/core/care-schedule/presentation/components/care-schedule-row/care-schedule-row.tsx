import {
  Droplets,
  Sprout,
  Scissors,
  Shovel,
  ArrowRightLeft,
  Bug,
  CloudRain,
  RotateCw,
  MoreHorizontal,
} from 'lucide-react';
import type { ReactElement } from 'react';
import type { CareSchedule, CareScheduleActivityType } from '@/core/care-schedule/domain/types/care-schedule.interface';
import { toISODate } from '@/core/care-schedule/presentation/utils/to-iso-date/to-iso-date.util';
import { formatDueDate } from '@/core/care-schedule/presentation/utils/format-due-date/format-due-date.util';
import { Chip } from '@/shared/presentation/components/ui/chip/chip';
import { EntityRow, EntityRowAction } from '@/shared/presentation/components/ui/entity-row/entity-row';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const ACTIVITY_ICONS: Record<CareScheduleActivityType, ReactElement> = {
  WATERING: <Droplets className="w-4 h-4" />,
  FERTILIZING: <Sprout className="w-4 h-4" />,
  PRUNING: <Scissors className="w-4 h-4" />,
  REPOTTING: <Shovel className="w-4 h-4" />,
  TRANSPLANTING: <ArrowRightLeft className="w-4 h-4" />,
  PEST_TREATMENT: <Bug className="w-4 h-4" />,
  MISTING: <CloudRain className="w-4 h-4" />,
  ROTATION: <RotateCw className="w-4 h-4" />,
  OTHER: <MoreHorizontal className="w-4 h-4" />,
};

type Props = {
  careSchedule: CareSchedule;
  dict: AppDict['careSchedule'];
  plantName?: string;
  onComplete: (id: string) => void;
  onEdit?: (careSchedule: CareSchedule) => void;
  onDelete: (id: string) => void;
  className?: string;
};

export function CareScheduleRow({ careSchedule, dict, plantName, onComplete, onEdit, onDelete, className }: Props) {
  // Compare calendar days only — a task due "today" is not overdue just because its time-of-day already passed.
  const isOverdue = careSchedule.active && toISODate(new Date(careSchedule.nextDueAt)) < toISODate(new Date());

  return (
    <EntityRow
      className={className}
      actions={
        <>
          {careSchedule.active && (
            <EntityRowAction label={dict.row.complete} onClick={() => onComplete(careSchedule.id)} variant="accent" />
          )}
          {onEdit && (
            <EntityRowAction label={dict.row.edit} onClick={() => onEdit(careSchedule)} />
          )}
          <EntityRowAction label={dict.row.delete} onClick={() => onDelete(careSchedule.id)} variant="destructive" />
        </>
      }
    >
      <div className="flex items-center gap-3">
        <span className="text-[var(--forest)]">{ACTIVITY_ICONS[careSchedule.activityType]}</span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{dict.row.activityTypes[careSchedule.activityType]}</span>
            {plantName && <span className="text-xs text-muted-foreground">· {plantName}</span>}
            {isOverdue && (
              <Chip variant="terra" className="text-[10px]">
                {dict.row.overdueLabel}
              </Chip>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {dict.row.dueLabel} {formatDueDate(careSchedule.nextDueAt)}
          </span>
        </div>
      </div>
    </EntityRow>
  );
}
