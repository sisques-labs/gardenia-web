import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateInventoryItemUseCase } from '@/core/inventory/application/use-cases/update-inventory-item/update-inventory-item.use-case';
import { InventoryGqlRepository } from '@/core/inventory/infrastructure/repositories/graphql/inventory.gql.repository';
import type { UpdateInventoryItemInput } from '@/core/inventory/application/interfaces/update-inventory-item-input.interface';

const updateInventoryItemUseCase = new UpdateInventoryItemUseCase(new InventoryGqlRepository());

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateInventoryItemInput) => updateInventoryItemUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
