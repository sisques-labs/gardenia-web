import { useState } from 'react';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import { useDeleteInventoryItem } from '@/core/inventory/presentation/hooks/use-delete-inventory-item/use-delete-inventory-item.hook';

export function useDeleteInventoryItemConfirm() {
  const deleteInventoryItem = useDeleteInventoryItem();
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  function requestDelete(item: InventoryItem) {
    setItemToDelete(item);
  }

  function confirmDelete() {
    if (!itemToDelete) return;
    deleteInventoryItem.mutate(itemToDelete.id, {
      onSettled: () => setItemToDelete(null),
    });
  }

  function cancelDelete() {
    setItemToDelete(null);
  }

  return {
    itemToDelete,
    requestDelete,
    confirmDelete,
    cancelDelete,
    isError: deleteInventoryItem.isError,
  };
}
