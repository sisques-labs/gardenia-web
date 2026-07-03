'use client';

import { useMemo } from 'react';
import type { SortingState } from '@tanstack/react-table';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { DataTable, type DataTablePagination } from '@/shared/presentation/components/ui/table/table';
import { getInventoryColumns } from './inventory-columns';

type Props = {
  items: InventoryItem[];
  dict: AppDict['inventory'];
  onViewDetail: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  pagination?: DataTablePagination;
};

export function InventoryTable({
  items,
  dict,
  onViewDetail,
  onEdit,
  onAdjust,
  onDelete,
  sorting,
  onSortingChange,
  pagination,
}: Props) {
  const columns = useMemo(
    () => getInventoryColumns({ dict, onViewDetail, onEdit, onAdjust, onDelete }),
    [dict, onViewDetail, onEdit, onAdjust, onDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={items}
      enableRowSelection={false}
      sorting={sorting}
      onSortingChange={onSortingChange}
      pagination={pagination}
    />
  );
}
