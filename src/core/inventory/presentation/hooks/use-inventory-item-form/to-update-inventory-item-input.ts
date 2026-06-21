import type { InventoryItemFormValues } from '@/core/inventory/presentation/schemas/inventory-item.schema';
import type { UpdateInventoryItemInput } from '@/core/inventory/application/interfaces/update-inventory-item-input.interface';
import { trimOptional } from '@/shared/lib/trim-optional';

/** `quantity` is intentionally excluded — stock changes only via adjust. */
export function toUpdateInventoryItemInput(
  id: string,
  values: InventoryItemFormValues,
): UpdateInventoryItemInput {
  return {
    id,
    itemType: values.itemType,
    name: values.name.trim(),
    brand: trimOptional(values.brand) ?? null,
    notes: trimOptional(values.notes) ?? null,
    unit: values.unit,
    lowStockThreshold: values.lowStockThreshold ?? null,
    acquiredAt: trimOptional(values.acquiredAt) ?? null,
    expiresAt: trimOptional(values.expiresAt) ?? null,
  };
}
