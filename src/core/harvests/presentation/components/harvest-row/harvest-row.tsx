import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  harvest: Harvest;
  onDelete: (id: string) => void;
  onEdit: (harvest: Harvest) => void;
  dict: AppDict['harvests'];
};

export function HarvestRow({ harvest, onDelete, onEdit, dict }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-sm">{harvest.cropType}</span>
        <span className="text-xs text-muted-foreground">
          {harvest.quantity} {dict.units[harvest.unit]}
        </span>
        <span className="text-xs text-muted-foreground">{harvest.harvestedAt}</span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label={dict.row.edit}
          onClick={() => onEdit(harvest)}
          className="text-sm font-medium hover:opacity-80"
        >
          {dict.row.edit}
        </button>
        <button
          type="button"
          aria-label={dict.row.delete}
          onClick={() => onDelete(harvest.id)}
          className="text-destructive hover:text-destructive/80 text-sm font-medium"
        >
          {dict.row.delete}
        </button>
      </div>
    </div>
  );
}
