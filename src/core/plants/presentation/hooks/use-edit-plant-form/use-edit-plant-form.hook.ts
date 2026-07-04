import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdatePlant } from '@/core/plants/presentation/hooks/use-update-plant/use-update-plant.hook';
import { createPlantSchema, type CreatePlantFormValues } from '@/core/plants/presentation/schemas/create-plant.schema';

type EditablePlant = {
  id: string;
  name: string;
  imageUrl?: string;
};

export function useEditPlantForm(plant: EditablePlant, onClose: () => void) {
  const { mutate: updatePlant, isPending, error } = useUpdatePlant();

  const form = useForm<CreatePlantFormValues>({
    resolver: zodResolver(createPlantSchema),
    defaultValues: { name: plant.name, imageUrl: plant.imageUrl ?? '' },
  });

  const onSubmit = form.handleSubmit(({ name, imageUrl }) => {
    updatePlant(
      { id: plant.id, name, imageUrl: imageUrl || null },
      { onSuccess: onClose },
    );
  });

  return { form, onSubmit, isPending, error };
}
