import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePlantFromIdentification } from '@/core/plant-identification/presentation/hooks/use-create-plant-from-identification/use-create-plant-from-identification.hook';
import {
  createPlantFromIdentificationSchema,
  type CreatePlantFromIdentificationFormValues,
} from '@/core/plant-identification/presentation/schemas/create-plant-from-identification.schema';
import type { PlantIdentification } from '@/core/plant-identification/domain/interfaces/plant-identification.interface';

export function useCreatePlantFromIdentificationForm(
  identification: PlantIdentification,
  onSuccess: (plantId: string) => void,
) {
  const { mutate, isPending, error } = useCreatePlantFromIdentification();

  const form = useForm<CreatePlantFromIdentificationFormValues>({
    resolver: zodResolver(createPlantFromIdentificationSchema),
  });

  const onSubmit = form.handleSubmit(({ name }) => {
    mutate(
      { identificationId: identification.id, name },
      { onSuccess: ({ id }) => onSuccess(id) },
    );
  });

  return { form, onSubmit, isPending, error };
}
