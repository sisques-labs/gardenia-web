'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  inventoryItemSchema,
  type InventoryItemFormValues,
} from '@/core/inventory/presentation/schemas/inventory-item.schema';
import { useCreateInventoryItem } from '@/core/inventory/presentation/hooks/use-create-inventory-item/use-create-inventory-item.hook';
import { useUpdateInventoryItem } from '@/core/inventory/presentation/hooks/use-update-inventory-item/use-update-inventory-item.hook';
import type { InventoryItem } from '@/core/inventory/domain/types/inventory-item.interface';
import type { CreateInventoryItemInput } from '@/core/inventory/application/interfaces/create-inventory-item-input.interface';
import type { UpdateInventoryItemInput } from '@/core/inventory/application/interfaces/update-inventory-item-input.interface';

type UseInventoryItemFormOptions = {
  item?: InventoryItem;
  onClose: () => void;
};

const trimmed = (value?: string): string | undefined => {
  const v = value?.trim();
  return v ? v : undefined;
};

function toCreateInput(values: InventoryItemFormValues): CreateInventoryItemInput {
  return {
    itemType: values.itemType,
    name: values.name.trim(),
    brand: trimmed(values.brand),
    notes: trimmed(values.notes),
    quantity: values.quantity,
    unit: values.unit,
    lowStockThreshold: values.lowStockThreshold,
    acquiredAt: trimmed(values.acquiredAt),
    expiresAt: trimmed(values.expiresAt),
  };
}

function toUpdateInput(id: string, values: InventoryItemFormValues): UpdateInventoryItemInput {
  return {
    id,
    itemType: values.itemType,
    name: values.name.trim(),
    brand: trimmed(values.brand) ?? null,
    notes: trimmed(values.notes) ?? null,
    unit: values.unit,
    lowStockThreshold: values.lowStockThreshold ?? null,
    acquiredAt: trimmed(values.acquiredAt) ?? null,
    expiresAt: trimmed(values.expiresAt) ?? null,
  };
}

export function useInventoryItemForm({ item, onClose }: UseInventoryItemFormOptions) {
  const isEditing = !!item;

  const { mutate: createItem, isPending: isCreating } = useCreateInventoryItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateInventoryItem();

  const isPending = isCreating || isUpdating;

  const form = useForm<InventoryItemFormValues>({
    resolver: zodResolver(inventoryItemSchema) as Resolver<InventoryItemFormValues>,
    defaultValues: item
      ? {
          itemType: item.itemType,
          name: item.name,
          brand: item.brand ?? '',
          notes: item.notes ?? '',
          quantity: item.quantity,
          unit: item.unit,
          lowStockThreshold: item.lowStockThreshold ?? undefined,
          acquiredAt: item.acquiredAt ? item.acquiredAt.slice(0, 10) : '',
          expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : '',
        }
      : {
          itemType: 'SEEDS',
          unit: 'UNITS',
          name: '',
          brand: '',
          notes: '',
          quantity: 0,
          acquiredAt: '',
          expiresAt: '',
        },
  });

  const { handleSubmit, watch, setValue } = form;

  const onSubmit = handleSubmit((values) => {
    if (isEditing && item) {
      updateItem(toUpdateInput(item.id, values), { onSuccess: onClose });
    } else {
      createItem(toCreateInput(values), { onSuccess: onClose });
    }
  });

  return {
    form,
    isEditing,
    isPending,
    onSubmit,
    selectedType: watch('itemType'),
    setType: (val: InventoryItemFormValues['itemType']) => setValue('itemType', val),
    selectedUnit: watch('unit'),
    setUnit: (val: InventoryItemFormValues['unit']) => setValue('unit', val),
  };
}
