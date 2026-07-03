import type { ListCriteria } from '@/shared/domain/interfaces/list-criteria.interface';
import type { InventoryItemQueryableField } from '@/core/inventory/domain/enums/inventory-item-queryable-field.enum';

export type InventoryListCriteria = ListCriteria<InventoryItemQueryableField>;
