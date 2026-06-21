import type { InventoryItemFormValues } from '@/core/inventory/presentation/schemas/inventory-item.schema';
import type { CreateInventoryItemInput } from '@/core/inventory/application/interfaces/create-inventory-item-input.interface';
import { trimOptional } from '@/shared/lib/trim-optional';

export function toCreateInventoryItemInput(
  values: InventoryItemFormValues,
): CreateInventoryItemInput {
  return {
    itemType: values.itemType,
    name: values.name.trim(),
    brand: trimOptional(values.brand),
    notes: trimOptional(values.notes),
    quantity: values.quantity,
    unit: values.unit,
    lowStockThreshold: values.lowStockThreshold,
    acquiredAt: trimOptional(values.acquiredAt),
    expiresAt: trimOptional(values.expiresAt),
  };
}
