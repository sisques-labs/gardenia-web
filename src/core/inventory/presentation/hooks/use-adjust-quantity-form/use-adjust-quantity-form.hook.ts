'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  adjustQuantitySchema,
  type AdjustQuantityFormValues,
} from '@/core/inventory/presentation/schemas/adjust-quantity.schema';
import { useAdjustInventoryItemQuantity } from '@/core/inventory/presentation/hooks/use-adjust-inventory-item-quantity/use-adjust-inventory-item-quantity.hook';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';

type UseAdjustQuantityFormOptions = {
  item: InventoryItem;
  onClose: () => void;
};

export function useAdjustQuantityForm({ item, onClose }: UseAdjustQuantityFormOptions) {
  const { mutate: adjustQuantity, isPending } = useAdjustInventoryItemQuantity();

  const form = useForm<AdjustQuantityFormValues>({
    resolver: zodResolver(adjustQuantitySchema) as Resolver<AdjustQuantityFormValues>,
    defaultValues: { delta: 0, reason: '' },
  });

  const onSubmit = form.handleSubmit((values) => {
    adjustQuantity(
      { id: item.id, delta: values.delta, reason: values.reason.trim() },
      { onSuccess: onClose },
    );
  });

  return { form, isPending, onSubmit };
}
