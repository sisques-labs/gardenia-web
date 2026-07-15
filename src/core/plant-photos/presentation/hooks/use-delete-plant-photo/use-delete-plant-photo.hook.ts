import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeletePlantPhotoUseCase } from '@/core/plant-photos/application/use-cases/delete-plant-photo/delete-plant-photo.use-case';
import { plantPhotosHttpRepository } from '@/core/plant-photos/infrastructure/repositories/http/plant-photos-http.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

const deletePlantPhotoUseCase = new DeletePlantPhotoUseCase(plantPhotosHttpRepository);

export function useDeletePlantPhoto(plantId: string) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlantPhotoUseCase.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plant-photos', spaceId, plantId] });
      queryClient.invalidateQueries({ queryKey: ['plant', spaceId, plantId] });
    },
  });
}
