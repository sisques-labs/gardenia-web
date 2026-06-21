import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteInventoryItemUseCase } from '@/core/inventory/application/use-cases/delete-inventory-item/delete-inventory-item.use-case';
import { InventoryGqlRepository } from '@/core/inventory/infrastructure/repositories/graphql/inventory.gql.repository';

const deleteInventoryItemUseCase = new DeleteInventoryItemUseCase(new InventoryGqlRepository());

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteInventoryItemUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
