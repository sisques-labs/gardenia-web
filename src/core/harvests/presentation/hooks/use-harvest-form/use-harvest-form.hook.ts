'use client';

import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { harvestSchema, type HarvestFormValues } from '@/core/harvests/presentation/schemas/harvest.schema';
import { useCreateHarvest } from '@/core/harvests/presentation/hooks/use-create-harvest/use-create-harvest.hook';
import { useUpdateHarvest } from '@/core/harvests/presentation/hooks/use-update-harvest/use-update-harvest.hook';
import type { Harvest } from '@/core/harvests/domain/types/harvest.interface';

type UseHarvestFormOptions = {
  harvest?: Harvest;
  onClose: () => void;
};

export function useHarvestForm({ harvest, onClose }: UseHarvestFormOptions) {
  const isEditing = !!harvest;

  const { mutate: createHarvest, isPending: isCreating } = useCreateHarvest();
  const { mutate: updateHarvest, isPending: isUpdating } = useUpdateHarvest();

  const isPending = isCreating || isUpdating;

  const form = useForm<HarvestFormValues>({
    resolver: zodResolver(harvestSchema) as Resolver<HarvestFormValues>,
    defaultValues: harvest
      ? {
          cropType: harvest.cropType,
          quantity: harvest.quantity,
          unit: harvest.unit,
          harvestedAt: harvest.harvestedAt,
        }
      : {
          unit: 'KG' as const,
        },
  });

  const { handleSubmit, watch, setValue } = form;

  const selectedUnit = watch('unit');

  const onSubmit = handleSubmit((values) => {
    if (isEditing) {
      updateHarvest(
        { id: harvest.id, ...values },
        { onSuccess: onClose },
      );
    } else {
      createHarvest(values, { onSuccess: onClose });
    }
  });

  return {
    form,
    isPending,
    onSubmit,
    selectedUnit,
    setUnit: (val: HarvestFormValues['unit']) => setValue('unit', val),
  };
}
