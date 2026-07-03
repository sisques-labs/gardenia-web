'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { InventoryTable } from '@/core/inventory/presentation/components/inventory-table/inventory-table';
import { InventoryItemModal } from '@/core/inventory/presentation/components/inventory-item-modal/inventory-item-modal';
import { AdjustQuantityModal } from '@/core/inventory/presentation/components/adjust-quantity-modal/adjust-quantity-modal';
import { InventoryFilters } from '@/core/inventory/presentation/components/inventory-filters/inventory-filters';
import { InventoryListSkeleton } from '@/core/inventory/presentation/components/inventory-list-skeleton/inventory-list-skeleton';
import { InventoryItemDetailDrawer } from '@/core/inventory/presentation/components/inventory-item-detail-drawer/inventory-item-detail-drawer';
import { usePaginatedInventoryItems } from '@/core/inventory/presentation/hooks/use-paginated-inventory-items/use-paginated-inventory-items.hook';
import { useDeleteInventoryItemConfirm } from '@/core/inventory/presentation/hooks/use-delete-inventory-item-confirm/use-delete-inventory-item-confirm.hook';
import { useInventoryFilters } from '@/core/inventory/presentation/hooks/use-inventory-filters/use-inventory-filters.hook';
import { InventoryItemQueryableField } from '@/core/inventory/domain/enums/inventory-item-queryable-field.enum';
import type { InventorySort } from '@/core/inventory/application/interfaces/inventory-sort.interface';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import { SortDirection } from '@/shared/domain/enums/sort-direction.enum';
import { useUrlPage } from '@/shared/presentation/hooks/use-url-page/use-url-page.hook';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { Alert } from '@/shared/presentation/components/ui/alert/alert';
import { Button } from '@/shared/presentation/components/ui/button/button';
import { ConfirmDialog } from '@/shared/presentation/components/ui/confirm-dialog/confirm-dialog';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['inventory'];
  lang: string;
};

function toInventorySorts(sorting: SortingState): InventorySort[] {
  return sorting.map((s) => ({
    field: s.id === 'quantity' ? InventoryItemQueryableField.QUANTITY : InventoryItemQueryableField.NAME,
    direction: s.desc ? SortDirection.DESC : SortDirection.ASC,
  }));
}

export function InventoryListScreen({ dict, lang }: Props) {
  const { page, onPageChange } = useUrlPage();
  const [sorting, setSorting] = useState<SortingState>([]);
  const sorts = useMemo(() => toInventorySorts(sorting), [sorting]);

  const { itemToDelete, requestDelete, confirmDelete, cancelDelete, isError } =
    useDeleteInventoryItemConfirm();
  const {
    filterState,
    filters,
    setQuery,
    setType,
    toggleLowStock,
    toggleExpiringSoon,
    removeFilter,
  } = useInventoryFilters();

  const { data, isLoading } = usePaginatedInventoryItems({ page, filters, sorts });
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const onPageChangeRef = useRef(onPageChange);
  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  });

  const isFirstFiltersRender = useRef(true);
  useEffect(() => {
    if (isFirstFiltersRender.current) {
      isFirstFiltersRender.current = false;
      return;
    }
    // Reads onPageChange via a ref (not as a dependency) because its identity
    // changes on every page navigation (useUrlPage derives it from
    // searchParams) — depending on it directly would re-fire this effect
    // right after the user navigates to another page, bouncing them back to
    // page 1. This should only reset the page when `filters` itself changes.
    onPageChangeRef.current(1);
  }, [filters]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [viewingItem, setViewingItem] = useState<InventoryItem | null>(null);

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
          filters={filterState}
          onQueryChange={setQuery}
          onTypeChange={setType}
          onToggleLowStock={toggleLowStock}
          onToggleExpiringSoon={toggleExpiringSoon}
          onRemoveFilter={removeFilter}
        />

        {isError && <Alert variant="error" message={dict.delete.error} />}

        {isLoading ? (
          <InventoryListSkeleton />
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-sm">{dict.list.empty}</p>
        ) : (
          <InventoryTable
            items={items}
            dict={dict}
            onViewDetail={(i) => setViewingItem(i)}
            onEdit={(i) => setEditingItem(i)}
            onAdjust={(i) => setAdjustingItem(i)}
            onDelete={requestDelete}
            sorting={sorting}
            onSortingChange={setSorting}
            pagination={
              totalPages > 1
                ? {
                    page: data?.page ?? page,
                    pageSize: data?.perPage ?? 20,
                    total: data?.total ?? 0,
                    onPageChange,
                  }
                : undefined
            }
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

      <InventoryItemDetailDrawer
        dict={dict}
        lang={lang}
        item={viewingItem}
        onClose={() => setViewingItem(null)}
      />

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
