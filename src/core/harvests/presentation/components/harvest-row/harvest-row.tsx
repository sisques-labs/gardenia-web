import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';
import { EntityRow, EntityRowAction } from '@/shared/presentation/components/ui/entity-row/entity-row';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  harvest: Harvest;
  onDelete: (id: string) => void;
  onEdit: (harvest: Harvest) => void;
  dict: AppDict['harvests'];
};

export function HarvestRow({ harvest, onDelete, onEdit, dict }: Props) {
  return (
    <EntityRow
      actions={
        <>
          <EntityRowAction label={dict.row.edit} onClick={() => onEdit(harvest)} />
          <EntityRowAction label={dict.row.delete} onClick={() => onDelete(harvest.id)} variant="destructive" />
        </>
      }
    >
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-sm">{harvest.cropType}</span>
        <span className="text-xs text-muted-foreground">
          {harvest.quantity} {dict.units[harvest.unit]}
        </span>
        <span className="text-xs text-muted-foreground">{harvest.harvestedAt}</span>
      </div>
    </EntityRow>
  );
}
