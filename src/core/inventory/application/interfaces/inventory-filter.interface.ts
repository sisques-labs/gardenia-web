import type { Filter } from '@/shared/domain/interfaces/filter.interface';
import type { InventoryItemQueryableField } from '@/core/inventory/domain/enums/inventory-item-queryable-field.enum';

export type InventoryFilter = Filter<InventoryItemQueryableField>;
