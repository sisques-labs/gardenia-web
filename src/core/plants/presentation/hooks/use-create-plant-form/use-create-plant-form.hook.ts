import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePlant } from '@/core/plants/presentation/hooks/use-create-plant/use-create-plant.hook';
import { createPlantSchema, type CreatePlantFormValues } from '@/core/plants/presentation/schemas/create-plant.schema';

export function useCreatePlantForm(spaceId: string | null, onClose: () => void) {
  const { mutate: createPlant, isPending, error } = useCreatePlant(spaceId);

  const form = useForm<CreatePlantFormValues>({
    resolver: zodResolver(createPlantSchema),
  });

  const onSubmit = form.handleSubmit(({ name, imageUrl, species }) => {
    createPlant(
      {
        name,
        imageUrl: imageUrl || undefined,
        gbifSpeciesKey: species?.gbifKey,
        speciesScientificName: species?.scientificName,
      },
      { onSuccess: onClose },
    );
  });

  return { form, onSubmit, isPending, error };
}
