import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { InventoryFiltersState } from './inventory-filters-state.interface';
import { isLowStock } from './is-low-stock';
import { isExpiringSoon } from './is-expiring-soon';

export function filterInventoryItems(
  items: InventoryItem[],
  state: InventoryFiltersState,
  now: Date = new Date(),
): InventoryItem[] {
  const normalizedQuery = state.query.trim().toLowerCase();
  return items.filter((item) => {
    if (state.type !== 'ALL' && item.itemType !== state.type) return false;
    if (normalizedQuery && !item.name.toLowerCase().includes(normalizedQuery)) return false;
    if (state.lowStockOnly && !isLowStock(item)) return false;
    if (state.expiringSoonOnly && !isExpiringSoon(item, now)) return false;
    return true;
  });
}
