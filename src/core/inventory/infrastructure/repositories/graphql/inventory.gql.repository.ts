import { apolloClient } from '@/shared/infrastructure/http/apollo.client';
import type { IInventoryRepository } from '@/core/inventory/application/ports/inventory.repository.port';
import type { CreateInventoryItemInput } from '@/core/inventory/application/interfaces/create-inventory-item-input.interface';
import type { UpdateInventoryItemInput } from '@/core/inventory/application/interfaces/update-inventory-item-input.interface';
import type { AdjustInventoryItemQuantityInput } from '@/core/inventory/application/interfaces/adjust-inventory-item-quantity-input.interface';
import type { InventoryListCriteria } from '@/core/inventory/application/interfaces/inventory-list-criteria.interface';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { CreatedEntity } from '@/shared/domain/interfaces/created-entity.interface';
import type { PaginatedResult } from '@/shared/domain/interfaces/paginated-result.interface';
import { INVENTORY_ITEMS_FIND_BY_CRITERIA } from './queries/inventory-items-find-by-criteria.query';
import { INVENTORY_ITEM_FIND_BY_ID } from './queries/inventory-item-find-by-id.query';
import { INVENTORY_ITEM_CREATE } from './mutations/inventory-item-create.mutation';
import { INVENTORY_ITEM_UPDATE } from './mutations/inventory-item-update.mutation';
import { INVENTORY_ITEM_ADJUST_QUANTITY } from './mutations/inventory-item-adjust-quantity.mutation';
import { INVENTORY_ITEM_DELETE } from './mutations/inventory-item-delete.mutation';
import type { InventoryItemsFindByCriteriaResponse } from './responses/inventory-items-find-by-criteria.response';
import type { InventoryItemFindByIdResponse } from './responses/inventory-item-find-by-id.response';
import type {
  InventoryItemCreateResponse,
  InventoryItemUpdateResponse,
  InventoryItemAdjustQuantityResponse,
  InventoryItemDeleteResponse,
} from './responses/inventory-item-mutation.response';

export class InventoryGqlRepository implements IInventoryRepository {
  async findByCriteria(criteria?: InventoryListCriteria): Promise<PaginatedResult<InventoryItem>> {
    const res = await apolloClient.query<InventoryItemsFindByCriteriaResponse>({
      query: INVENTORY_ITEMS_FIND_BY_CRITERIA,
      variables: { input: criteria },
      fetchPolicy: 'network-only',
    });
    const data = res.data?.inventoryItemsFindByCriteria;
    const page = criteria?.pagination?.page ?? 1;
    const perPage = criteria?.pagination?.perPage ?? 20;
    return {
      items: data?.items ?? [],
      total: data?.total ?? 0,
      page: data?.page ?? page,
      perPage: data?.perPage ?? perPage,
      totalPages: data?.totalPages ?? 1,
    };
  }

  async findById(id: string): Promise<InventoryItem> {
    const res = await apolloClient.query<InventoryItemFindByIdResponse>({
      query: INVENTORY_ITEM_FIND_BY_ID,
      variables: { input: { id } },
      fetchPolicy: 'network-only',
    });
    if (!res.data?.inventoryItemFindById) {
      throw new Error(`Inventory item not found: ${id}`);
    }
    return res.data.inventoryItemFindById;
  }

  async create(input: CreateInventoryItemInput): Promise<CreatedEntity> {
    const res = await apolloClient.mutate<InventoryItemCreateResponse>({
      mutation: INVENTORY_ITEM_CREATE,
      variables: { input },
    });
    if (!res.data?.inventoryItemCreate?.success) {
      throw new Error('inventoryItemCreate mutation failed');
    }
    return { id: res.data.inventoryItemCreate.id };
  }

  async update(input: UpdateInventoryItemInput): Promise<CreatedEntity> {
    const res = await apolloClient.mutate<InventoryItemUpdateResponse>({
      mutation: INVENTORY_ITEM_UPDATE,
      variables: { input },
    });
    if (!res.data?.inventoryItemUpdate?.success) {
      throw new Error('inventoryItemUpdate mutation failed');
    }
    return { id: res.data.inventoryItemUpdate.id };
  }

  async adjustQuantity(input: AdjustInventoryItemQuantityInput): Promise<CreatedEntity> {
    const res = await apolloClient.mutate<InventoryItemAdjustQuantityResponse>({
      mutation: INVENTORY_ITEM_ADJUST_QUANTITY,
      variables: { input },
    });
    if (!res.data?.inventoryItemAdjustQuantity?.success) {
      throw new Error('inventoryItemAdjustQuantity mutation failed');
    }
    return { id: res.data.inventoryItemAdjustQuantity.id };
  }

  async delete(id: string): Promise<void> {
    await apolloClient.mutate<InventoryItemDeleteResponse>({
      mutation: INVENTORY_ITEM_DELETE,
      variables: { id },
    });
  }
}

export const inventoryGqlRepository = new InventoryGqlRepository();
