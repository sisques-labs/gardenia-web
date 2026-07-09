import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadPlantPhotoUseCase } from '@/core/plant-photos/application/use-cases/upload-plant-photo/upload-plant-photo.use-case';
import { plantPhotosHttpRepository } from '@/core/plant-photos/infrastructure/repositories/http/plant-photos-http.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

const uploadPlantPhotoUseCase = new UploadPlantPhotoUseCase(plantPhotosHttpRepository);

export function useUploadPlantPhoto(plantId: string) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadPlantPhotoUseCase.execute(plantId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plant-photos', spaceId, plantId] });
      queryClient.invalidateQueries({ queryKey: ['plant', spaceId, plantId] });
    },
  });
}
