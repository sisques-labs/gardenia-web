import { useQuery } from '@tanstack/react-query';
import { GetInventoryItemsUseCase } from '@/core/inventory/application/use-cases/get-inventory-items/get-inventory-items.use-case';
import { InventoryGqlRepository } from '@/core/inventory/infrastructure/repositories/graphql/inventory.gql.repository';
import type { InventoryFilter } from '@/core/inventory/application/interfaces/inventory-filter.interface';
import type { InventorySort } from '@/core/inventory/application/interfaces/inventory-sort.interface';

const getInventoryItemsUseCase = new GetInventoryItemsUseCase(new InventoryGqlRepository());

const DEFAULT_PAGE_SIZE = 20;

export interface UsePaginatedInventoryItemsOptions {
  page?: number;
  perPage?: number;
  filters?: InventoryFilter[];
  sorts?: InventorySort[];
}

/** Server-side paginated, filtered and sorted inventory items for the list screen. */
export function usePaginatedInventoryItems(options?: UsePaginatedInventoryItemsOptions) {
  const page = options?.page ?? 1;
  const perPage = options?.perPage ?? DEFAULT_PAGE_SIZE;
  const filters = options?.filters ?? [];
  const sorts = options?.sorts ?? [];

  return useQuery({
    queryKey: ['inventory', 'paginated', page, perPage, filters, sorts],
    queryFn: () => getInventoryItemsUseCase.execute({ filters, sorts, pagination: { page, perPage } }),
  });
}
