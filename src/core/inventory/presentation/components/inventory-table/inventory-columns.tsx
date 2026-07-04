import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { Badge } from '@/shared/presentation/components/ui/badge/badge';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { SortableHeader } from '@/shared/presentation/components/ui/table/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/presentation/components/ui/dropdown-menu/dropdown-menu';
import { isLowStock } from '@/core/inventory/presentation/hooks/use-inventory-filters/is-low-stock';
import { isExpiringSoon } from '@/core/inventory/presentation/hooks/use-inventory-filters/is-expiring-soon';

export type InventoryColumnsParams = {
  dict: AppDict['inventory'];
  onViewDetail: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
};

export function getInventoryColumns({
  dict,
  onViewDetail,
  onEdit,
  onAdjust,
  onDelete,
}: InventoryColumnsParams): ColumnDef<InventoryItem>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>{dict.form.name}</SortableHeader>,
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
      enableSorting: false,
      cell: ({ row }) => dict.types[row.original.itemType],
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => <SortableHeader column={column}>{dict.form.quantity}</SortableHeader>,
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
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={dict.row.actionsMenu}
                  className="p-2"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onViewDetail(item)}>
                  {dict.row.viewDetail}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onAdjust(item)}>
                  {dict.row.adjust}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onEdit(item)}>
                  {dict.row.edit}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem danger onSelect={() => onDelete(item)}>
                  {dict.row.delete}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
