'use client';

import { useState } from 'react';
import { InventoryTable } from '@/core/inventory/presentation/components/inventory-table/inventory-table';
import { InventoryItemModal } from '@/core/inventory/presentation/components/inventory-item-modal/inventory-item-modal';
import { AdjustQuantityModal } from '@/core/inventory/presentation/components/adjust-quantity-modal/adjust-quantity-modal';
import { InventoryFilters } from '@/core/inventory/presentation/components/inventory-filters/inventory-filters';
import { useInventoryItems } from '@/core/inventory/presentation/hooks/use-inventory-items/use-inventory-items.hook';
import { useDeleteInventoryItem } from '@/core/inventory/presentation/hooks/use-delete-inventory-item/use-delete-inventory-item.hook';
import { useInventoryFilters } from '@/core/inventory/presentation/hooks/use-inventory-filters/use-inventory-filters.hook';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import { PageHeader } from '@/shared/presentation/components/page-header/page-header';
import { Button } from '@/shared/presentation/components/ui/button/button';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

const shimmer = 'bg-muted rounded animate-pulse';

function InventoryRowSkeleton() {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <div className={`h-4 w-1/3 ${shimmer}`} />
          <div className={`h-3 w-1/4 ${shimmer}`} />
          <div className={`h-3 w-1/4 ${shimmer}`} />
        </div>
        <div className={`h-8 w-16 ${shimmer}`} />
      </div>
    </div>
  );
}

type Props = {
  dict: AppDict['inventory'];
  lang: string;
};

export function InventoryListScreen({ dict, lang: _lang }: Props) {
  const { items, isLoading } = useInventoryItems();
  const { mutate: deleteItem } = useDeleteInventoryItem();
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
      <PageHeader
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

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <InventoryRowSkeleton key={i} />
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
            onDelete={(id) => deleteItem(id)}
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
    </div>
  );
}
