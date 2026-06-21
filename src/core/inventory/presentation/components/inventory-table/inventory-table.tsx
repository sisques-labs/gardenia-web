'use client';

import { useMemo } from 'react';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';
import { DataTable } from '@/shared/presentation/components/ui/table/table';
import { getInventoryColumns } from './inventory-columns';

type Props = {
  items: InventoryItem[];
  dict: AppDict['inventory'];
  onEdit: (item: InventoryItem) => void;
  onAdjust: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
};

export function InventoryTable({ items, dict, onEdit, onAdjust, onDelete }: Props) {
  const columns = useMemo(
    () => getInventoryColumns({ dict, onEdit, onAdjust, onDelete }),
    [dict, onEdit, onAdjust, onDelete],
  );

  return <DataTable columns={columns} data={items} enableRowSelection={false} />;
}
