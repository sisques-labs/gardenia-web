'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { plantingSpotSchema, type PlantingSpotFormValues } from '@/core/planting-spots/presentation/schemas/planting-spot.schema';
import { usePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-planting-spot/use-planting-spot.hook';
import { useCreatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-create-planting-spot/use-create-planting-spot.hook';
import { useUpdatePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-update-planting-spot/use-update-planting-spot.hook';
import { useDeletePlantingSpot } from '@/core/planting-spots/presentation/hooks/use-delete-planting-spot/use-delete-planting-spot.hook';

type UseePlantingSpotFormProps = {
  mode: 'create' | 'edit';
  spotId?: string;
  lang: string;
};

export function usePlantingSpotForm({ mode, spotId, lang }: UseePlantingSpotFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { spot, isLoading } = usePlantingSpot(spotId ?? '');
  const createMutation = useCreatePlantingSpot();
  const updateMutation = useUpdatePlantingSpot();
  const deleteMutation = useDeletePlantingSpot();

  const form = useForm<PlantingSpotFormValues>({
    resolver: zodResolver(plantingSpotSchema),
    values: spot
      ? { name: spot.name, type: spot.type, description: spot.description ?? '' }
      : { name: '', type: 'RAISED_BED', description: '' },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: PlantingSpotFormValues) {
    if (isEdit && spotId) {
      updateMutation.mutate(
        { id: spotId, ...values },
        { onSuccess: () => router.push(`/${lang}/planting-spots`) },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => router.push(`/${lang}/planting-spots`),
      });
    }
  }

  function handleDelete() {
    if (spotId) {
      deleteMutation.mutate(spotId, {
        onSuccess: () => router.push(`/${lang}/planting-spots`),
      });
    }
    setDeleteOpen(false);
  }

  function navigateToList() {
    router.push(`/${lang}/planting-spots`);
  }

  return {
    form,
    spot,
    isLoading,
    isEdit,
    isPending,
    deleteOpen,
    setDeleteOpen,
    onSubmit,
    handleDelete,
    navigateToList,
    deleteMutation,
  };
}
