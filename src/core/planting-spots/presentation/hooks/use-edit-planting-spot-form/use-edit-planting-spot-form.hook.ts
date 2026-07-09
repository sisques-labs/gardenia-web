import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { plantingSpotSchema, type PlantingSpotFormValues } from '@/core/planting-spots/presentation/schemas/planting-spot.schema';
import { useUpdatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook';
import type { PlantingSpot } from '@/core/planting-spots/domain/interfaces/planting-spot.interface';

export function useEditPlantingSpotForm(spot: PlantingSpot, onClose: () => void) {
  const { mutate: updatePlantingSpot, isPending, error } = useUpdatePlantingSpot();

  const form = useForm<PlantingSpotFormValues>({
    resolver: zodResolver(plantingSpotSchema),
    defaultValues: {
      name: spot.name,
      type: spot.type,
      description: spot.description ?? '',
      capacity: spot.capacity ?? null,
      row: spot.row ?? null,
      column: spot.column ?? null,
      dimensionsWidth: spot.dimensionsWidth ?? null,
      dimensionsHeight: spot.dimensionsHeight ?? null,
      dimensionsLength: spot.dimensionsLength ?? null,
      soilType: spot.soilType ?? '',
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    updatePlantingSpot(
      {
        id: spot.id,
        ...values,
        description: values.description || null,
        soilType: values.soilType || null,
      },
      { onSuccess: onClose },
    );
  });

  return { form, onSubmit, isPending, error };
}
