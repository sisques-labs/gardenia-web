import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IdentifyPlantUseCase } from '@/core/plant-identification/application/use-cases/identify-plant/identify-plant.use-case';
import { plantIdentificationHttpRepository } from '@/core/plant-identification/infrastructure/repositories/http/plant-identification-http.repository';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { IdentifyPlantInput } from '@/core/plant-identification/application/interfaces/identify-plant-input.interface';

const identifyPlantUseCase = new IdentifyPlantUseCase(plantIdentificationHttpRepository);

export function useIdentifyPlant() {
  const spaceId = useSpacesStore((s) => s.currentSpaceId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: IdentifyPlantInput) => identifyPlantUseCase.execute(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plant-identifications', spaceId] });
    },
  });
}
