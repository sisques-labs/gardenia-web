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
import { Chip } from '@/shared/presentation/components/ui/chip/chip';
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
};

export function CareScheduleRow({ careSchedule, dict, plantName, onComplete, onEdit, onDelete }: Props) {
  const isOverdue = careSchedule.active && new Date(careSchedule.nextDueAt).getTime() < new Date().getTime();

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
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
            {dict.row.dueLabel} {careSchedule.nextDueAt}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        {careSchedule.active && (
          <button
            type="button"
            aria-label={dict.row.complete}
            onClick={() => onComplete(careSchedule.id)}
            className="text-sm font-medium text-[var(--forest)] hover:opacity-80"
          >
            {dict.row.complete}
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            aria-label={dict.row.edit}
            onClick={() => onEdit(careSchedule)}
            className="text-sm font-medium hover:opacity-80"
          >
            {dict.row.edit}
          </button>
        )}
        <button
          type="button"
          aria-label={dict.row.delete}
          onClick={() => onDelete(careSchedule.id)}
          className="text-destructive hover:text-destructive/80 text-sm font-medium"
        >
          {dict.row.delete}
        </button>
      </div>
    </div>
  );
}
