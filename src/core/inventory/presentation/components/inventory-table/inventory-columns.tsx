import type { ColumnDef } from '@tanstack/react-table';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { Badge } from '@/shared/presentation/components/ui/badge/badge';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { isLowStock } from '@/core/inventory/presentation/hooks/use-inventory-filters/is-low-stock';
import { isExpiringSoon } from '@/core/inventory/presentation/hooks/use-inventory-filters/is-expiring-soon';

export type InventoryColumnsParams = {
  dict: AppDict['inventory'];
  onEdit: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
};

export function getInventoryColumns({
  dict,
  onEdit,
  onAdjust,
  onDelete,
}: InventoryColumnsParams): ColumnDef<InventoryItem>[] {
  return [
    {
      accessorKey: 'name',
      header: dict.form.name,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{item.name}</span>
            {item.brand && <span className="text-xs text-muted-foreground">{item.brand}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'itemType',
      header: dict.form.itemType,
      cell: ({ row }) => dict.types[row.original.itemType],
    },
    {
      accessorKey: 'quantity',
      header: dict.form.quantity,
      cell: ({ row }) => `${row.original.quantity} ${dict.units[row.original.unit]}`,
    },
    {
      id: 'status',
      header: dict.list.statusColumn,
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        const lowStock = isLowStock(item);
        const expiringSoon = isExpiringSoon(item);
        if (!lowStock && !expiringSoon) return null;
        return (
          <div className="flex gap-2">
            {lowStock && <Badge variant="terra">{dict.list.lowStockBadge}</Badge>}
            {expiringSoon && <Badge variant="honey">{dict.list.expiringBadge}</Badge>}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: dict.list.actionsColumn,
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={dict.row.adjust}
              onClick={() => onAdjust(item)}
            >
              {dict.row.adjust}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={dict.row.edit}
              onClick={() => onEdit(item)}
            >
              {dict.row.edit}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={dict.row.delete}
              onClick={() => onDelete(item.id)}
              className="text-[var(--terracotta)] hover:text-[var(--terracotta)]"
            >
              {dict.row.delete}
            </Button>
          </div>
        );
      },
    },
  ];
}
