export const INVENTORY_ITEM_TYPES = [
  'SEEDS',
  'FERTILIZER',
  'SUBSTRATE',
  'PHYTOSANITARY',
  'OTHER',
] as const;

export type InventoryItemType = (typeof INVENTORY_ITEM_TYPES)[number];

export const INVENTORY_UNITS = ['UNITS', 'G', 'KG', 'ML', 'L', 'PACKETS'] as const;

export type InventoryUnit = (typeof INVENTORY_UNITS)[number];

export interface InventoryItem {
  id: string;
  itemType: InventoryItemType;
  name: string;
  brand: string | null;
  notes: string | null;
  quantity: number;
  unit: InventoryUnit;
  lowStockThreshold: number | null;
  acquiredAt: string | null;
  expiresAt: string | null;
  userId: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
}
