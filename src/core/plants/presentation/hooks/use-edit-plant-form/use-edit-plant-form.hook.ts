import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdatePlant } from '@/core/plants/presentation/hooks/use-update-plant/use-update-plant.hook';
import { createPlantSchema, type CreatePlantFormValues } from '@/core/plants/presentation/schemas/create-plant.schema';
import type { GbifSpeciesSuggestion } from '@/core/plants/domain/interfaces/gbif-species-suggestion.interface';

type EditablePlant = {
  id: string;
  name: string;
  imageUrl?: string;
  species?: GbifSpeciesSuggestion | null;
};

export function useEditPlantForm(plant: EditablePlant, onClose: () => void) {
  const { mutate: updatePlant, isPending, error } = useUpdatePlant();

  const form = useForm<CreatePlantFormValues>({
    resolver: zodResolver(createPlantSchema),
    defaultValues: {
      name: plant.name,
      imageUrl: plant.imageUrl ?? '',
      species: plant.species?.gbifKey != null ? plant.species : null,
    },
  });

  const onSubmit = form.handleSubmit(({ name, imageUrl, species }) => {
    updatePlant(
      {
        id: plant.id,
        name,
        imageUrl: imageUrl || null,
        gbifSpeciesKey: species?.gbifKey ?? null,
        speciesScientificName: species?.scientificName ?? null,
      },
      { onSuccess: onClose },
    );
  });

  return { form, onSubmit, isPending, error };
}
