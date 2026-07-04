import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteInventoryItemsBulkUseCase } from '@/core/inventory/application/use-cases/delete-inventory-items-bulk/delete-inventory-items-bulk.use-case';
import { InventoryGqlRepository } from '@/core/inventory/infrastructure/repositories/graphql/inventory.gql.repository';

const deleteInventoryItemsBulkUseCase = new DeleteInventoryItemsBulkUseCase(new InventoryGqlRepository());

export function useBulkDeleteInventoryItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => deleteInventoryItemsBulkUseCase.execute(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
