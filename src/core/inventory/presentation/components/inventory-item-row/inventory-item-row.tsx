import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { Badge } from '@/shared/presentation/components/ui/badge/badge';
import {
  isLowStock,
  isExpiringSoon,
} from '@/core/inventory/presentation/hooks/use-inventory-filters/use-inventory-filters.hook';

type Props = {
  item: InventoryItem;
  dict: AppDict['inventory'];
  onEdit: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
};

export function InventoryItemRow({ item, dict, onEdit, onAdjust, onDelete }: Props) {
  const lowStock = isLowStock(item);
  const expiringSoon = isExpiringSoon(item);

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">{item.name}</span>
          {item.brand && <span className="text-xs text-muted-foreground">· {item.brand}</span>}
        </div>
        <span className="text-xs text-muted-foreground">{dict.types[item.itemType]}</span>
        <span className="text-xs text-muted-foreground">
          {item.quantity} {dict.units[item.unit]}
        </span>
        {(lowStock || expiringSoon) && (
          <div className="flex gap-2 pt-1">
            {lowStock && <Badge variant="terra">{dict.list.lowStockBadge}</Badge>}
            {expiringSoon && <Badge variant="honey">{dict.list.expiringBadge}</Badge>}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label={dict.row.adjust}
          onClick={() => onAdjust(item)}
          className="text-sm font-medium hover:opacity-80"
        >
          {dict.row.adjust}
        </button>
        <button
          type="button"
          aria-label={dict.row.edit}
          onClick={() => onEdit(item)}
          className="text-sm font-medium hover:opacity-80"
        >
          {dict.row.edit}
        </button>
        <button
          type="button"
          aria-label={dict.row.delete}
          onClick={() => onDelete(item.id)}
          className="text-destructive hover:text-destructive/80 text-sm font-medium"
        >
          {dict.row.delete}
        </button>
      </div>
    </div>
  );
}
