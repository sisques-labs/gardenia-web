import { z } from 'zod';
import {
  INVENTORY_ITEM_TYPES,
  INVENTORY_UNITS,
} from '@/core/inventory/domain/types/inventory-item.interface';

export const inventoryItemSchema = z.object({
  itemType: z.enum(INVENTORY_ITEM_TYPES),
  name: z.string().min(1).max(200),
  brand: z.string().max(200).optional().or(z.literal('')),
  notes: z.string().max(2000).optional().or(z.literal('')),
  quantity: z.coerce.number().min(0),
  unit: z.enum(INVENTORY_UNITS),
  lowStockThreshold: z.coerce.number().min(0).optional(),
  acquiredAt: z.string().optional().or(z.literal('')),
  expiresAt: z.string().optional().or(z.literal('')),
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;
