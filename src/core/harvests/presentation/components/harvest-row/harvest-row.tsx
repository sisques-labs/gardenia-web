import type { Harvest } from '@/core/harvests/domain/interfaces/harvest.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  harvest: Harvest;
  onDelete: (id: string) => void;
  dict: AppDict['harvests'];
};

export function HarvestRow({ harvest, onDelete, dict }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-sm">{harvest.cropType}</span>
        <span className="text-xs text-muted-foreground">
          {harvest.quantity} {dict.units[harvest.unit]}
        </span>
        <span className="text-xs text-muted-foreground">{harvest.harvestedAt}</span>
      </div>
      <button
        type="button"
        aria-label="Delete"
        onClick={() => onDelete(harvest.id)}
        className="text-destructive hover:text-destructive/80 text-sm font-medium"
      >
        Delete
      </button>
    </div>
  );
}
