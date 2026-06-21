import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdjustInventoryItemQuantityUseCase } from '@/core/inventory/application/use-cases/adjust-inventory-item-quantity/adjust-inventory-item-quantity.use-case';
import { InventoryGqlRepository } from '@/core/inventory/infrastructure/repositories/graphql/inventory.gql.repository';
import type { AdjustInventoryItemQuantityInput } from '@/core/inventory/application/interfaces/adjust-inventory-item-quantity-input.interface';

const adjustInventoryItemQuantityUseCase = new AdjustInventoryItemQuantityUseCase(
  new InventoryGqlRepository(),
);

export function useAdjustInventoryItemQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdjustInventoryItemQuantityInput) =>
      adjustInventoryItemQuantityUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
