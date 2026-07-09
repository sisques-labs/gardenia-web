import { useQuery } from '@tanstack/react-query';
import { GetPlantPhotosUseCase } from '@/core/plant-photos/application/use-cases/get-plant-photos/get-plant-photos.use-case';
import { plantPhotosHttpRepository } from '@/core/plant-photos/infrastructure/repositories/http/plant-photos-http.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';

const getPlantPhotosUseCase = new GetPlantPhotosUseCase(plantPhotosHttpRepository);

export function usePlantPhotos(plantId: string) {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  return useQuery({
    queryKey: ['plant-photos', spaceId, plantId],
    queryFn: () => getPlantPhotosUseCase.execute(plantId),
    enabled: !!spaceId && !!plantId,
  });
}
