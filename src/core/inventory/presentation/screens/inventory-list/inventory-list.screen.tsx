'use client';

import { useState } from 'react';
import { InventoryTable } from '@/core/inventory/presentation/components/inventory-table/inventory-table';
import { InventoryItemModal } from '@/core/inventory/presentation/components/inventory-item-modal/inventory-item-modal';
import { AdjustQuantityModal } from '@/core/inventory/presentation/components/adjust-quantity-modal/adjust-quantity-modal';
import { InventoryFilters } from '@/core/inventory/presentation/components/inventory-filters/inventory-filters';
import { useInventoryItems } from '@/core/inventory/presentation/hooks/use-inventory-items/use-inventory-items.hook';
import { useDeleteInventoryItemConfirm } from '@/core/inventory/presentation/hooks/use-delete-inventory-item-confirm/use-delete-inventory-item-confirm.hook';
import { useInventoryFilters } from '@/core/inventory/presentation/hooks/use-inventory-filters/use-inventory-filters.hook';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { ConfirmDialog } from '@/shared/presentation/components/ui/confirm-dialog/confirm-dialog';
import { RowSkeleton } from '@/shared/presentation/components/ui/row-skeleton/row-skeleton';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['inventory'];
  lang: string;
};

export function InventoryListScreen({ dict, lang: _lang }: Props) {
  const { items, isLoading } = useInventoryItems();
  const { itemToDelete, requestDelete, confirmDelete, cancelDelete, isError } =
    useDeleteInventoryItemConfirm();
  const {
    filters,
    filteredItems,
    setQuery,
    setType,
    toggleLowStock,
    toggleExpiringSoon,
  } = useInventoryFilters(items);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);

  return (
    <div>
      <ScreenHeader
        title={dict.list.title}
        actions={
          <Button
            size="sm"
            className="ml-1 bg-forest hover:bg-forest-2 text-white gap-1"
            onClick={() => setIsCreateOpen(true)}
          >
            {dict.list.newItem}
          </Button>
        }
      />

      <div className="flex flex-col gap-6 px-6 py-6">
        <InventoryFilters
          dict={dict}
          filters={filters}
          onQueryChange={setQuery}
          onTypeChange={setType}
          onToggleLowStock={toggleLowStock}
          onToggleExpiringSoon={toggleExpiringSoon}
        />

        {isError && <Alert variant="error" message={dict.delete.error} />}

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <RowSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">{dict.list.empty}</p>
        ) : (
          <InventoryTable
            items={filteredItems}
            dict={dict}
            onEdit={(i) => setEditingItem(i)}
            onAdjust={(i) => setAdjustingItem(i)}
            onDelete={requestDelete}
          />
        )}
      </div>

      {isCreateOpen && (
        <InventoryItemModal dict={dict} onClose={() => setIsCreateOpen(false)} />
      )}
      {editingItem && (
        <InventoryItemModal dict={dict} item={editingItem} onClose={() => setEditingItem(null)} />
      )}
      {adjustingItem && (
        <AdjustQuantityModal dict={dict} item={adjustingItem} onClose={() => setAdjustingItem(null)} />
      )}

      <ConfirmDialog
        open={!!itemToDelete}
        onOpenChange={(open) => {
          if (!open) cancelDelete();
        }}
        title={dict.delete.confirmTitle}
        description={dict.delete.confirmDescription}
        confirmLabel={dict.delete.confirm}
        cancelLabel={dict.delete.cancel}
        destructive
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
