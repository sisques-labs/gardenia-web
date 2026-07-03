import type { Sort } from '@/shared/domain/interfaces/sort.interface';
import type { InventoryItemQueryableField } from '@/core/inventory/domain/enums/inventory-item-queryable-field.enum';

export type InventorySort = Sort<InventoryItemQueryableField>;
