import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateInventoryItemUseCase } from '@/core/inventory/application/use-cases/create-inventory-item/create-inventory-item.use-case';
import { InventoryGqlRepository } from '@/core/inventory/infrastructure/repositories/graphql/inventory.gql.repository';
import type { CreateInventoryItemInput } from '@/core/inventory/application/interfaces/create-inventory-item-input.interface';

const createInventoryItemUseCase = new CreateInventoryItemUseCase(new InventoryGqlRepository());

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateInventoryItemInput) => createInventoryItemUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
