import { useQuery } from '@tanstack/react-query';
import { GetInventoryItemsUseCase } from '@/core/inventory/application/use-cases/get-inventory-items/get-inventory-items.use-case';
import { InventoryGqlRepository } from '@/core/inventory/infrastructure/repositories/graphql/inventory.gql.repository';

const getInventoryItemsUseCase = new GetInventoryItemsUseCase(new InventoryGqlRepository());

export function useInventoryItems() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => getInventoryItemsUseCase.execute(),
  });

  return { items: data ?? [], isLoading, error };
}
