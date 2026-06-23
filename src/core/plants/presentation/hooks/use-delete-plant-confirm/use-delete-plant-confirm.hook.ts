import { useState } from 'react';
import type { Plant } from '@/core/plants/domain/interfaces/plant.interface';
import { useDeletePlant } from '@/core/plants/presentation/hooks/use-delete-plant/use-delete-plant.hook';

export function useDeletePlantConfirm(spaceId: string | null) {
  const deletePlant = useDeletePlant(spaceId);
  const [plantToDelete, setPlantToDelete] = useState<Plant | null>(null);

  function requestDelete(plant: Plant) {
    setPlantToDelete(plant);
  }

  function confirmDelete() {
    if (!plantToDelete) return;
    deletePlant.mutate(plantToDelete.id, {
      onSettled: () => setPlantToDelete(null),
    });
  }

  function cancelDelete() {
    setPlantToDelete(null);
  }

  return {
    plantToDelete,
    requestDelete,
    confirmDelete,
    cancelDelete,
    isError: deletePlant.isError,
  };
}
